// @flow
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

/**
 * Turns an iterator into a linked lazy list like structure.
 */
export class Stream<T> {
  done: boolean

  constructor (done: boolean) {
    Object.defineProperty(this, 'done', { writeable: false, value: done })
  }

  /**
   * The default implementation on this doesn't do much, other
   * than throwing an error, but once overriden it's intended
   * to represent the operation of moving forward.
   */
  shiftForward (): Stream<T> {
    throw new TypeError('abstract method')
  }
}


/**
 * The end of a stream.
 */
export class EndStream<T> extends Stream<T> {
  constructor () {
    super(true)
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
 */
export class ContStream<T> extends Stream<T> {
  value: T
  _next: ?Stream<T>
  _iter: Iterator<T>

  constructor (value: T, iterator: Iterator<T>) {
    super(false)
    Object.defineProperty(this, 'value', { writeable: false, value: value })
    this._iter = iterator
    this._next = null
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
