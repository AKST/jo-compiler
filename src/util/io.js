// @flow
import fs from 'fs'
import fsPromise from 'fs-promise'
import S2A from 'stream-to-async-iterator'

export type StrIOIter = AsyncIterable<string>

export const readFile = fsPromise.readFile

export async function* readStream (fileName: string, options?: Object = {}): StrIOIter {
  const _options = { defaultEncoding: 'utf8', ...options }
  const iter = new S2A(fs.createReadStream(fileName, { ..._options }))
  for await (const chunk of iter) {
    yield chunk.toString()
  }
}

export default { readFile, readStream }
