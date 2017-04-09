import 'babel-polyfill'

import { readStream } from '@/util/io'
import getConfig from '@/init/args'
import { tokenStream } from '@/pass/lexer'

(async function () {
  try {
    const config = getConfig()

    for (const fileName of config.files) {
      console.log(`Tokens for '${fileName}'`)

      for await (const token of tokenStream(readStream(fileName))) {
        console.log(`  token: ${token.toString()}`)
      }

      // for await (const chunk of io.readStream(fileName)) {
      //   for (const token of tokens(withIterable(chunk))) {
      //     console.log(`  token: ${token.toString()}`)
      //   }
      // }
    }
  }
  catch (error) {
    console.error(error)
  }
}())
