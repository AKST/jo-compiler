// @flow
import fs from 'fs'
import fsPromise from 'fs-promise'
import S2A from 'stream-to-async-iterator'

export type StrIOIter = AsyncIterator<string>

export const readFile = fsPromise.readFile

export async function* readStream (fileName: string, options?: Object = {}): StrIOIter {
  const _options = { defaultEncoding: 'utf8', ...options }
  const iter = new S2A(fs.createReadStream(fileName, { ..._options }))
  for await (const chunk of iter) {
    yield chunk.toString()
  }
}

/**
 * Creates an async generator of input from stdin.
 */
export async function* stdin (): StrIOIter {
  const iter = new S2A(process.stdin)
  for await (const chunk of iter) {
    yield chunk.toString()
  }
}

export async function* stdout (): AsyncGenerator<void, void, string> {
  const write = process.stdout.write.bind(process.stdout)
  while (true) {
    const output: string = yield
    await nodeCallbackAsPromise(write, output, 'utf8')
  }
}

/**
 * Turns a node callback into a promise.
 *
 * @access private
 * @param fn - The function.
 * @param initialArgs - The arguments before the callback.
 */
function nodeCallbackAsPromise (fn: Function, ...initialArgs: Array<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(...initialArgs, (err, data) => err != null ? reject(err) : resolve(data))
  })
}

export default { readFile, readStream }
