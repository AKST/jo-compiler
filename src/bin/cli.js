// @flow
import 'babel-polyfill'
import { Unimplemented } from '@/data/error'

import type { ConfigDescriptor } from '@/data/config'
import getConfig from '@/core/args'
import debug from '@/core/debug'


export async function main (): Promise<number> {
  const config: ConfigDescriptor = getConfig()


  if (config.mode === 'debug:build') {
    const result = await debug(config)
    console.log(JSON.stringify(result, null, 1))
    return 0
  }
  else {
    throw new Unimplemented(`cli mode for '${config.mode}'`)
  }
}

async function onError (error: Error): Promise<number> {
  console.error(error.toString())
  return 1
}

if (require.main === module) {
  main()
    .catch(onError)
    .then(exitCode => process.exit(exitCode))
}

