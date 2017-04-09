import 'babel-polyfill'

import io from 'fs-promise'
import { withIterable } from '@/core/stream'
import getConfig from '@/init/args'
import tokens from '@/pass/lexer'

(async function () {
  try {
    const config = getConfig()

    for (const fileName of config.files) {
      console.log(`Tokens for '${fileName}'`)
      const fileContents = await io.readFile(fileName, { encoding: 'utf8' })
      for (const token of tokens(withIterable(fileContents))) {
        console.log(`  token: ${token.toString()}`)
      }
    }
  }
  catch (error) {
    console.error(error)
  }
}())
