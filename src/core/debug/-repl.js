// @flow

import type { ConfigDebugRepl, ReplInterface, DebugMode } from '~/data/config'
import type { InputProducer, OutputConsumer } from '~/util/io'
import { iter } from '~/util/data'

import type { Data as Lexicon, State as LexState } from '~/pass/lexer'
import * as lexer from '~/pass/lexer'

import type { Data as Syntax, State as ParseState } from '~/pass/parse'
import * as parser from '~/pass/parse'

import Capture from '~/data/reactive/async-gen-capture'
import { Unimplemented } from '~/data/error'
import { defaultReplInterface } from '~/data/config'
import { takeWhile, join } from '~/util/array'


export async function withRepl (
    config: ConfigDebugRepl,
    input: InputProducer,
    output: OutputConsumer,
    initialInterface: ?ReplInterface = null,
  ): Promise<void> {
  const cli = initialInterface || defaultReplInterface()
  const intepreter: Pipe<string, Object, Object> = getPipe(config.debug)
  let state = null

  while (true) {
    await output.push(cli.startInput)
    const update = await input.pull()
    if (update.done) break

    const response = state == null
      ? intepreter.push(update.value)
      : intepreter.pushWith(update.value, state)
    state = await processChunks(response, cli, output)
  }
}

/////////////////////////////////////////////////////////

type ReplyChunk<O, S> = { type: 'data', value: O }
                      | { type: 'suspend', state: S }

interface Pipe<I, O, S> {
  push (input: I): PipeReply<O, S>,
  pushWith (input: I, state: S): PipeReply<O, S>,
}

interface PipeReply<O, S> {
  pullChunk (): Promise<ReplyChunk<O, S>>,
}

function omitLocationInJson (k, v) {
  return k === 'location' ? undefined : v
}

/**
 * Incrementally processes chunks of output from a repl state.
 *
 * @param reply - The reply object.
 * @param cli - Interface for the cli.
 * @param out - Where output is directed.
 */
async function processChunks <S> (reply: PipeReply<Object, S>, cli: ReplInterface, out: OutputConsumer): Promise<S> {
  loop: while (true) {
    const update = await reply.pullChunk()
    switch (update.type) {
      case 'data': {
        const asJson = JSON.stringify(update.value, omitLocationInJson, 2)
        out.push(formatOutput(cli, asJson))
        continue loop
      }
      case 'suspend': {
        return update.state
      }
    }
  }
  // eslint-disable-next-line no-unreachable
  throw new Unimplemented('unreachable')
}


/////////////////////////////////////////////////////////


class _GenToPipeReply<O, S> implements PipeReply<O, S> {
  _gen: AsyncGenerator<O, S, any>

  constructor (gen: AsyncGenerator<O, S, any>) {
    this._gen = gen
  }

  async pullChunk (): Promise<ReplyChunk<O, S>> {
    const { done, value } = await this._gen.next()

    if (value == null) throw new TypeError('illegal state')

    // IDK what the go with flow is, not sure why i can't
    // return the property type here.
    return (((done
      ? { type: 'suspend', state: value }
      : { type: 'data', value: value }
    ): any): ReplyChunk<O, S>)
  }
}


class LexerPipe implements Pipe<string, Lexicon, LexState> {
  push (s: string): PipeReply<Lexicon, LexState> {
    return this.pushWith(s, lexer.initialState())
  }

  pushWith (s: string, state: LexState) {
    const generator = lexer.asyncStateMachine(state, [s])
    return new _GenToPipeReply(generator)
  }
}

type ParsePipeState = { type: 'initial' }
                    | { type: 'partial', l: LexState, p: ParseState }

class ParsePipe implements Pipe<string, Syntax, ParsePipeState> {
  push (s: string): PipeReply<Syntax, ParsePipeState> {
    return this.pushWith(s, { type: 'initial' })
  }

  __getPassStates (state: ParsePipeState): [LexState, ParseState] {
    if (state.type === 'initial') {
      return [lexer.initialState(), parser.initialState()]
    }
    else if (state.type === 'partial') {
      return [state.l, state.p]
    }
    throw new Unimplemented('unimplmented state')
  }

  pushWith (s: string, state: ParsePipeState): PipeReply<Syntax, ParsePipeState> {
    const [lexStart, synState] = this.__getPassStates(state)

    return new _GenToPipeReply(async function* () {
      const lexicons =
        Capture.create(lexer.asyncStateMachine(lexStart, [s]))
      const p = yield * parser.asyncStateMachine(synState, [lexicons.generator])
      const l: LexState = (lexicons.finish: any)
      return { type: 'partial', l, p }
    }())
  }
}

/**
 * @param mode - The debug mode for the pipe.
 */
function getPipe (mode: DebugMode): Pipe<string, any, any> {
  switch (mode) {
    case 'lexer':
      return new LexerPipe()
    case 'parse':
      return new ParsePipe()
    default:
      throw new Unimplemented(`'${mode}' mode is not supported by debug repl`)
  }
}


/////////////////////////////////////////////////////////


function formatOutput (cliInterface: ReplInterface, output: string): string {
  const split: Iterable<string> = takeWhile(it => !! it.trim())(output.split('\n'))
  const joined = join(`\n${cliInterface.continueOutput}`)(split)
  return `${cliInterface.startOutput}${joined}\n`
}
