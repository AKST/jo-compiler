// @flow

import type { ConfigDebugRepl, ReplInterface, DebugMode } from '~/data/config'
import type { InputProducer, OutputConsumer } from '~/util/io'

import type { Data as Lexicon, State as LexState } from '~/pass/lexer'
import { initialState, asyncStateMachine } from '~/pass/lexer'

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

    // await output.push(formatOutput(cli, update.value))
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
        const asJson = JSON.stringify(update.value, omitLocationInJson)
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
    return (((done
      ? { type: 'suspend', state: value }
      : { type: 'data', value: value }
    ): any): ReplyChunk<O, S>)
  }
}


class LexerPipe implements Pipe<string, Lexicon, LexState> {
  push (s: string): PipeReply<Lexicon, LexState> {
    return this.pushWith(s, initialState())
  }

  pushWith (s: string, state: LexState) {
    // $FlowTodo This is literally the only way to start a iterator
    const input = [s][Symbol.iterator]()
    const generator = asyncStateMachine(state, input)
    return new _GenToPipeReply(generator)
  }
}

/**
 * @param mode - The debug mode for the pipe.
 */
function getPipe (mode: DebugMode): Pipe<string, any, any> {
  type DumbReply = { state: number } & PipeReply<any, any>
  const dumbyReply = (): DumbReply => ({
    state: 0,

    pullChunk () {
      this.state += 1
      return this.state > 3
        ? Promise.resolve({ type: 'suspend', state: null })
        : Promise.resolve({ type: 'data', value: this.state })
    },
  })

  const dumbyPipe = {
    pushWith (s: string, ss: any) {
      return dumbyReply()
    },
    push (s: string) {
      return dumbyReply()
    },
  }

  switch (mode) {
    case 'lexer':
      return new LexerPipe()
    case 'parse':
      return dumbyPipe
    default:
      throw new Unimplemented('impossible error')
  }
}


/////////////////////////////////////////////////////////


function formatOutput (cliInterface: ReplInterface, output: string): string {
  const split: Iterable<string> = takeWhile(it => !! it.trim())(output.split('\n'))
  const joined = join(`\n${cliInterface.continueOutput}`)(split)
  return `${cliInterface.startOutput}${joined}\n`
}
