// @flow
import fs from 'fs'
import fsPromise from 'fs-promise'

import Consumer, { consumerFromStream } from '~/data/reactive/consumer'
import Producer, { producerFromStream } from '~/data/reactive/producer'

export type InputProducer = Producer<string>
export type OutputConsumer = Consumer<string>

export const readFile = fsPromise.readFile

export function readStream (fileName: string, options?: Object = {}): InputProducer {
  const _options = { defaultEncoding: 'utf8', ...options }
  const fstream = fs.createReadStream(fileName, { ..._options })
  return producerFromStream(fstream)
}

/**
 * Creates an async generator of input from stdin.
 */
export function stdin (): InputProducer {
  return producerFromStream(process.stdin)
}

/**
 * Output consumer for stdout.
 */
export function stdout (): OutputConsumer {
  return consumerFromStream(process.stdout)
}

/**
 * Output consumer for stdout.
 */
export function stderr (): OutputConsumer {
  return consumerFromStream(process.stderr)
}
