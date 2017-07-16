// @flow
import S2A from 'stream-to-async-iterator'

export type Result<T> = { done: false, value: T } | { done: true }

export default class Producer<T> {
  _generator: AsyncGenerator<T, void, void>

  constructor (generator: AsyncGenerator<T, void, void>) {
    this._generator = generator
  }

  async pull (): Promise<Result<T>> {
    const update = await this._generator.next()
    if (update.done) {
      return { done: true }
    }
    if (! update.done && update.value != null) {
      return { done: false, value: update.value }
    }
    else {
      throw new TypeError('invalid generator was provided to producer')
    }
  }

  static makeWith (generator: () => AsyncGenerator<T, void, void>): Producer<T> {
    return new Producer(generator())
  }

  unsafeAsGenerator (): AsyncGenerator<T, void, void> {
    return this._generator
  }
}

//////////////////////////////////////////////////////////////////////////

export function producerFromStream (readStream: stream$Readable): Producer<string> {
  return Producer.makeWith(async function* () {
    const iter = new S2A(readStream)
    for await (const chunk of iter) {
      yield chunk.toString()
    }
  })
}
