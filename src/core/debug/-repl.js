// @flow

import type { ConfigDebugRepl, ReplInterface } from '@/data/config'
import type { InputProducer, OutputConsumer } from '@/util/io'

import { defaultReplInterface } from '@/data/config'
import { takeWhile, join } from '@/util/array'

export async function withRepl (
    config: ConfigDebugRepl,
    input: InputProducer,
    output: OutputConsumer,
    initialInterface: ?ReplInterface = null,
  ): Promise<void> {

  const cli = initialInterface || defaultReplInterface()
  while (true) {
    await output.push(cli.startInput)
    const update = await input.pull()
    if (update.done) break
    await output.push(formatOutput(cli, update.value))
  }
}

/////////////////////////////////////////////////////////

function formatOutput (cliInterface: ReplInterface, output: string): string {
  const split: Iterable<string> = takeWhile(it => !! it.trim())(output.split('\n'))
  const joined = join(`\n${cliInterface.continueInput}`)(split)
  return `${cliInterface.startOutput}${joined}\n`
}
