// @flow
import type { Maybe } from '@/data/maybe'
import { just, none } from '@/data/maybe'

export default function withIter<T> (iterator: Iterator<T>): Stream<T> {
  const { value, done } = iterator.next()
  if (done) {
    return new EndStream()
  }
  else if (value != null) {
    return new ContStream(value, iterator)
  }
  else {
    throw new TypeError('invalid iterator')
  }
}

export function withIterable<T> (iterable: Iterable<T>): Stream<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/1163
  return withIter(iterable[Symbol.iterator]())
}

/**
 * Turns an iterator into a linked lazy list like structure.
 */
export class Stream<T> {
  /**
   * Whether or not he stream has reached the end
   */
  done: boolean

  constructor (done: boolean) {
    Object.defineProperty(this, 'done', { writeable: false, value: done })
  }

  /**
   * If not at the end of the stream, it'll return
   * the current value of the current link.
   */
  current (): Maybe<T> {
    throw new TypeError('abstract method')
  }

  /**
   * Unless at the end of the stream, this will shift
   * the stream forward, and return the next link the
   * stream.
   */
  shiftForward (): Stream<T> {
    throw new TypeError('abstract method')
  }
}


/**
 * The end of a stream.
 * @access private
 */
class EndStream<T> extends Stream<T> {
  constructor () {
    super(true)
  }

  current (): Maybe<T> {
    return none()
  }

  /**
   * In an end stream, shiftForward basically returns itself.
   */
  shiftForward (): Stream<T> {
    return this
  }
}


/**
 * A stream with more items.
 * @access private
 */
class ContStream<T> extends Stream<T> {
  value: T
  _next: ?Stream<T>
  _iter: Iterator<T>

  constructor (value: T, iterator: Iterator<T>) {
    super(false)
    Object.defineProperty(this, 'value', { writeable: false, value: value })
    this._iter = iterator
    this._next = null
  }

  current (): Maybe<T> {
    return just(this.value)
  }

  /**
   * Returns the next link in the iterator stream.
   */
  shiftForward (): Stream<T> {
    if (this._next == null) {
      this._next = withIter(this._iter)
    }
    return this._next
  }
}
