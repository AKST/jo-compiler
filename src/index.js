import 'babel-polyfill'

import getConfig from '@/init/args'
import { readStream } from '@/util/io'
import { tokenStream } from '@/pass/lexer'

(async function () {
  try {
    const config = getConfig()

    for (const fileName of config.files) {
      console.log(`Tokens for '${fileName}'`)
      for await (const token of tokenStream(readStream(fileName))) {
        console.log(`  token: ${token.toString()}`)
      }
    }
  }
  catch (error) {
    console.error(error)
  }
}())
