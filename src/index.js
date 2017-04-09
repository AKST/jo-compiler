import 'babel-polyfill'

import io from '@/util/io'
import { withIterable } from '@/data/stream'
import getConfig from '@/init/args'
import tokens from '@/pass/lexer'

(async function () {
  try {
    const config = getConfig()

    for (const fileName of config.files) {
      console.log(`Tokens for '${fileName}'`)

      for await (const chunk of io.readStream(fileName)) {
        for (const token of tokens(withIterable(chunk))) {
          console.log(`  token: ${token.toString()}`)
        }
      }
    }
  }
  catch (error) {
    console.error(error)
  }
}())
