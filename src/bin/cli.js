import 'babel-polyfill'
import { Unimplemented } from '@/data/error'
import getConfig from '@/core/args'
import debug from '@/core/debug'

function hideLocation (key, value) {
  return key === 'location' ? undefined : value
}

(async function () {
  const config = getConfig()

  try {
    if (! config.debugMode) throw new Unimplemented('normal build')

    const result = await debug(config.debugMode, config)
    console.log(JSON.stringify(result, hideLocation, 1))
  }
  catch (error) {
    console.log(JSON.stringify(error, null, 1))
  }
}())
