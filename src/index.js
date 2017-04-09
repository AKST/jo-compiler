import 'babel-polyfill'

import getConfig from '@/init/args'
import { readStream } from '@/util/io'
import { tokenStream } from '@/pass/lexer'
import { parseModule } from '@/pass/parse'

const config = getConfig()

config.files.forEach(async fileName => {
  try {
    const tokens = tokenStream(readStream(fileName))
    const module = await parseModule(tokens)
    console.log(module.toJSON(2))
  }
  catch (error) {
    console.log(error.toJSON(true))
  }
})
