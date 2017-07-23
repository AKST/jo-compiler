// @flow
import 'babel-polyfill'
import { Unimplemented } from '~/data/error'
import type { ConfigDescriptor } from '~/data/config'

import getConfig from '~/core/args'
import { withFiles as debugFiles, withRepl as debugRepl } from '~/core/debug'
import { formatError } from '~/util/debug'
import { stdin as inputStream, stdout as outputConsumer } from '~/util/io'


export async function main (): Promise<number> {
  const config: ConfigDescriptor = getConfig()

  switch (config.mode) {
    case 'debug:build': {
      const result = await debugFiles(config)
      console.log(JSON.stringify(result, null, 1))
      return 0
    }
    case 'debug:repl':
      await debugRepl(config, inputStream(), outputConsumer())
      return 0
    default: {
      throw new Unimplemented(`CLI mode for '${config.mode}' is not implemented`)
    }
  }
}

async function onError (error: Error): Promise<number> {
  console.error(formatError(error))
  return 1
}

if (require.main === module) {
  main()
    .catch(onError)
    .then(exitCode => process.exit(exitCode))
}

