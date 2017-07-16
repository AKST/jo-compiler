// @flow

export default class Consumer<T> {
  _generator: AsyncGenerator<void, void, T>
  _firstCall: boolean

  constructor (generator: AsyncGenerator<void, void, T>) {
    this._firstCall = true
    this._generator = generator
  }

  async push (text: T): Promise<void> {
    if (this._firstCall) {
      // $FlowTodo
      await this._generator.next(null)
      this._firstCall = false
    }
    await this._generator.next(text)
  }

  static makeWith (generator: () => AsyncGenerator<void, void, T>): Consumer<T> {
    return new Consumer(generator())
  }
}

//////////////////////////////////////////////////////////////////////////

/**
 * Generic output consumer from a any stream.
 *
 * @param stream - The stream in which will be used as a consumer.
 */
export function consumerFromStream (stream: stream$Writable): Consumer<string> {
  return Consumer.makeWith(async function* () {
    const write = stream.write.bind(stream)
    while (true) {
      const output: string = yield
      await nodeCallbackAsPromise(write, output, 'utf8')
    }
  })
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
