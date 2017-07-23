// @flow

import type { ConfigDebugRepl, ReplInterface, DebugMode } from '~/data/config'
import type { InputProducer, OutputConsumer } from '~/util/io'

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

type ReplyChunkContinue<O> = { type: 'data', value: O }
type ReplyChunkSuspended<S> = { type: 'suspend', state: S }

interface Pipe<I, O, S> {
  push (input: I): PipeReply<O, S>,
  pushWith (input: I, state: O): PipeReply<O, S>,
}

interface PipeReply<O, S> {
  pullChunk (): Promise<ReplyChunk<O, S>>,
}

type ReplyChunk<O, S> = ReplyChunkContinue<O>
                      | ReplyChunkSuspended<S>

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
        const asJson = JSON.stringify(update.value, null, 2)
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


class LexerPipe {
  push (s: string) {
    throw new Unimplemented('not implemented')
  }

  pushWith (s: string, state: any) {
    throw new Unimplemented('not implemented')
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
  const joined = join(`\n${cliInterface.continueInput}`)(split)
  return `${cliInterface.startOutput}${joined}\n`
}
