import 'babel-polyfill'
import { Unimplemented } from '@/error'
import getConfig from '@/core/args'
import debug from '@/core/debug'

(async function () {
  const config = getConfig()

  try {
    if (! config.debugMode) throw new Unimplemented('normal build')

    const result = await debug(config.debugMode, config)
    console.log(JSON.stringify(result, function (key, value) {
      return key === 'location' ? undefined : value
    }, 1))
  }
  catch (error) {
    console.log(JSON.stringify(error, null, 1))
  }
}())
