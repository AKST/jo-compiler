// @flow

import { asyncIter } from '~/util/data'

export default class Capture<Y, R> {
  _generator: AsyncGenerator<Y, R, any>
  _didFinish: boolean
  _finish: ?R

  constructor (generator: AsyncGenerator<Y, R, any>) {
    this._generator = generator
    this._finish = null
    this._didFinish = false
  }

  get generator (): AsyncGenerator<Y, R, void> {
    // $FlowTodo: https://github.com/facebook/flow/issues/2286
    return this[Symbol.asyncIterator]()
  }

  get iterator (): AsyncIterator<Y> {
    return (async function* (self) {
      yield * self.generator
    }(this))
  }

  get iterable (): AsyncIterable<Y> {
    return this.iterator
  }

  get finish (): R {
    if (! this._didFinish) throw new TypeError('not finished')
    if (this._finish == null) throw new TypeError('failed')
    return this._finish
  }

  /*::
  @@asyncIterator(): AsyncGenerator<Y, R, void> {
    throw new Error()
  }*/

  // $FlowTodo: https://github.com/facebook/flow/issues/2286
  async * [Symbol.asyncIterator] () {
    const { done, value } = await this._generator.next()
    if (! done) {
      yield value
      return yield * asyncIter(this)
    }
    else {
      this._didFinish = true
      this._finish = value
      return value
    }
  }

  static create (generator: AsyncGenerator<Y, R, any>) {
    return new Capture(generator)
  }
}

