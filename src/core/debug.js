// @flow
import type { T as Config, DebugMode } from '@/data/config'
import type Token from '@/data/pass/lexer'
import type Module from '@/data/pass/syntax'

import { Unimplemented } from '@/data/error'
import { tokenStream } from '@/pass/lexer'
import { parseModule } from '@/pass/parse'
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

export default async function (mode: DebugMode, config: Config): Promise<Object> {
  const pass = getPass(mode)
  const result = { pass: mode, files: [] }
  for (const filename of config.files) {
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

async function parsePass (filename: string): Promise<Result<Module>> {
  const tokens = tokenStream(readStream(filename))
  const module = await parseModule(tokens)
  return { filename, data: module }
}

