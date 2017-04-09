import 'babel-polyfill'

import getConfig from '@/init/args'
import { readStream } from '@/util/io'
import { tokenStream } from '@/pass/lexer'

const config = getConfig()

config.files.forEach(async fileName => {
  console.log(`Tokens for '${fileName}'`)

  // emit all the tokens from the stream
  for await (const token of tokenStream(readStream(fileName))) {
    console.log(`  token: ${token.toString()}`)
  }
})
