// @flow
import type { ConfigDebugBuild, DebugMode } from '@/data/config'
import type Token from '@/data/pass/lexer'
import type Syntax from '@/data/pass/syntax'

import { Unimplemented } from '@/data/error'
import { readStream } from '@/util/io'
import { syntaxStream } from '@/pass/parse'
import { tokenStream } from '@/pass/lexer'

/////////////////////////////////////////////////////////

type TotalPass = (fileName: string) => Promise<Result<any>>
type Result<T> = { filename: string, data: T }

/////////////////////////////////////////////////////////

export async function withFiles (config: ConfigDebugBuild): Promise<Object> {
  const pass = getTotalPass(config.debug)
  const result = { pass: config.debug, files: [] }
  for (const filename of config.input) {
    result.files.push(await pass(filename))
  }
  return result
}

/////////////////////////////////////////////////////////

/**
 * This function returns a pass function that passes over
 * a complete set of input.
 *
 * @access private
 * @param mode - The debug mode.
 */
function getTotalPass (mode: DebugMode): TotalPass {
  /*
   * Lexicon pass
   */
  async function lexerPass (filename: string): Promise<Result<Array<Token>>> {
    const result = { filename, data: [] }
    for await (const token of tokenStream(readStream(filename))) {
      result.data.push(token)
    }
    return result
  }

  /*
   * Syntax pass
   */
  async function parsePass (filename: string): Promise<Result<Array<Syntax>>> {
    const result = { filename, data: [] }
    const tokens = tokenStream(readStream(filename))
    for await (const syntax of syntaxStream(tokens)) {
      result.data.push(syntax)
    }
    return result
  }

  /*
   * main logic
   */
  switch (mode) {
    case 'lexer': return lexerPass
    case 'parse': return parsePass
    default: throw new Unimplemented('impossible-error')
  }
}
