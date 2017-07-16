// @flow
import fs from 'fs'
import fsPromise from 'fs-promise'
import S2A from 'stream-to-async-iterator'

import Consumer, { consumerFromStream } from '@/data/reactive/consumer'

export type StrIOIter = AsyncIterator<string>

export type InputObservable = {}

export type OutputConsumer = Consumer<string>

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

/**
 * Output consumer for stdout.
 */
export function stdout (): Consumer<string> {
  return consumerFromStream(process.stdout)
}

/**
 * Output consumer for stdout.
 */
export function stderr (): Consumer<string> {
  return consumerFromStream(process.stderr)
}
