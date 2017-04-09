// @flow
import type { Maybe } from '@/data/maybe'
import { just, none } from '@/data/maybe'

export default function withIter<T> (iterator: Iterator<T>): Stream<T> {
  return _withIter(iterator, null)
}

export function withIterable<T> (iterable: ?Iterable<T>): Stream<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/1163
  return iterable != null ? withIter(iterable[Symbol.iterator]()) : new EndStream()
}

function _withIter<T> (iterator: Iterator<T>, extention: ?Stream<T>): Stream<T> {
  const { value, done } = iterator.next()
  if (done && extention == null) {
    return new EndStream()
  }
  if (done && extention != null) {
    return extention
  }
  else if (value != null) {
    return new ContStream(value, iterator, extention)
  }
  else {
    throw new TypeError('invalid iterator')
  }
}

/**
 * Turns an iterator into a linked lazy list like structure.
 */
class Stream<T> {
  /**
   * Whether or not he stream has reached the end
   */
  done: boolean

  constructor (done: boolean) {
    Object.defineProperty(this, 'done', { writeable: false, value: done })
  }

  /**
   * Appends a stream on the the end of another.
   *
   * @param more - Additional items.
   */
  extend (more: Stream<T>): Stream<T> {
    throw new TypeError('abstract method')
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

  extend (more: Stream<T>): Stream<T> {
    return more
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
  _extention: ?Stream<T>

  constructor (value: T, iterator: Iterator<T>, extention: ?Stream<T>) {
    super(false)
    Object.defineProperty(this, 'value', { writeable: false, value: value })
    this._iter = iterator
    this._next = null
    this._extention = extention
  }

  current (): Maybe<T> {
    return just(this.value)
  }

  extend (extention: Stream<T>): Stream<T> {
    if (this._extention == null) {
      const result = new ContStream(this.value, this._iter, extention)
      result._next = this._next
      return result
    }
    else {
      const result = new ContStream(this.value, this._iter, this._extention.extend(extention))
      result._next = this._next
      return result
    }
  }

  /**
   * Returns the next link in the iterator stream.
   */
  shiftForward (): Stream<T> {
    if (this._next == null) {
      this._next = _withIter(this._iter, this._extention)
    }
    return this._next
  }
}

export const T = Stream
