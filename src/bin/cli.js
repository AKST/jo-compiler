import 'babel-polyfill'
import { Unimplemented } from '@/data/error'
import getConfig from '@/core/args'
import debug from '@/core/debug'


export async function main () {
  const config = getConfig()
  if (! config.debugMode) throw new Unimplemented('normal build')

  const result = await debug(config.debugMode, config)
  console.log(JSON.stringify(result, null, 1))
  return 0
}

async function onError (error) {
  console.error(error.toString())
  return 1
}

if (require.main === module) {
  main()
    .catch(onError)
    .then(exitCode => process.exit(exitCode))
}

