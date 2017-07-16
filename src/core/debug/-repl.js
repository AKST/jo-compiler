// @flow

import type { ConfigDebugRepl, ReplInterface } from '@/data/config'
import { defaultReplInterface } from '@/data/config'

import type { InputObservable, OutputConsumer } from '@/util/io'

export async function withRepl (
    config: ConfigDebugRepl,
    input: InputObservable,
    output: OutputConsumer,
    initialInterface: ?ReplInterface = null,
  ): Promise<void> {

  const cli = initialInterface || defaultReplInterface()

  await output.consume(cli.startInput)
}

/////////////////////////////////////////////////////////

function formatOutput (cliInterface: ReplInterface, output: string): string {
  const split = output.split('\n').join(`\n${cliInterface.continueInput}`)
  return `${cliInterface.startOutput}${split}`
}
