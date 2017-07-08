// @flow
import type {
  ConfigDebugBuild,
  DebugMode,
} from '@/data/config'
import type Token from '@/data/pass/lexer'
import type Syntax from '@/data/pass/syntax'

import { Unimplemented } from '@/data/error'
import { tokenStream } from '@/pass/lexer'
import { syntaxStream } from '@/pass/parse'
import { readStream } from '@/util/io'

type Pass = (fileName: string) => Promise<Result<any>>
type Result<T> = { filename: string, data: T }

function getPass (name: DebugMode): Pass {
  switch (name) {
    case 'lexer': return lexerPass
    case 'parse': return parsePass
    default: throw new Unimplemented('impossible-error')
  }
}

export default async function (config: ConfigDebugBuild): Promise<Object> {
  const pass = getPass(config.debug)
  const result = { pass: config.debug, files: [] }
  for (const filename of config.input) {
    result.files.push(await pass(filename))
  }
  return result
}

/////////////////////////////////////////////////////////

async function lexerPass (filename: string): Promise<Result<Array<Token>>> {
  const result = { filename, data: [] }
  for await (const token of tokenStream(readStream(filename))) {
    result.data.push(token)
  }
  return result
}

async function parsePass (filename: string): Promise<Result<Array<Syntax>>> {
  const result = { filename, data: [] }
  const tokens = tokenStream(readStream(filename))
  for await (const syntax of syntaxStream(tokens)) {
    result.data.push(syntax)
  }
  return result
}

