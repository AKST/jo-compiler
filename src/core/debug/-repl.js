// @flow

import type { ConfigDebugRepl, ReplInterface, DebugMode } from '~/data/config'
import type { InputProducer, OutputConsumer } from '~/util/io'

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

type ReplyChunkContinue<O> = { state: 'cont', value: O }
type ReplyChunkSuspended<S> = { state: 'suspend', return: S }

type Pipe<I, O, S> = {
  push (input: I): PipeReply<O, S>,
  pushWith (input: I, state: O): PipeReply<O, S>
}

type PipeReply<O, S> = {
  pullChunk (): Promise<ReplyChunk<O, S>>
}

type ReplyChunk<O, S> = ReplyChunkContinue<O>
                      | ReplyChunkSuspended<S>

function getPipe (mode: DebugMode): Pipe<string, any, any> {
  const dumbyReply = {
    pullChunk () {
      return Promise.resolve({ state: 'suspend', return: null })
    },
  }

  const dumbyPipe = {
    pushWith (s: string, ss: any) {
      return dumbyReply
    },
    push (s: string) {
      return dumbyReply
    },
  }

  return dumbyPipe
}

async function processChunks <S> (reply: PipeReply<Object, S>, cli: ReplInterface, out, OutputConsumer): Promise<S> {
  return ({}: any)
}

/////////////////////////////////////////////////////////

function formatOutput (cliInterface: ReplInterface, output: string): string {
  const split: Iterable<string> = takeWhile(it => !! it.trim())(output.split('\n'))
  const joined = join(`\n${cliInterface.continueInput}`)(split)
  return `${cliInterface.startOutput}${joined}\n`
}
