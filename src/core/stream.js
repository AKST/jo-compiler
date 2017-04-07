// @flow
export default function withIter<T> (iterator: Iterator<T>): Stream<T> {
  const { value, done } = iterator.next()
  return new Stream(value, done, iterator)
}


export class Stream<T> {
  value: ?T
  done: boolean
  _next: ?Stream<T>
  _iter: Iterator<T>

  constructor (value: ?T, done: boolean, iterator: Iterator<T>) {
    Object.defineProperty(this, 'value', { writeable: false, value: value })
    Object.defineProperty(this, 'done', { writeable: false, value: done })
    this._iter = iterator
    this._next = null
  }

  shiftForward (): Stream<T> {
    if (this._next == null) {
      this._next = withIter(this._iter)
    }
    return this._next
  }
}
