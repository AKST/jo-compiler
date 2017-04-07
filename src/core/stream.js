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

export class Stream<T> {
  done: boolean

  constructor (done: boolean) {
    Object.defineProperty(this, 'done', { writeable: false, value: done })
  }

  shiftForward (): Stream<T> {
    throw new TypeError('abstract method')
  }
}


export class EndStream<T> extends Stream<T> {
  constructor () {
    super(true)
  }

  shiftForward (): Stream<T> {
    return this
  }
}


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

  shiftForward (): Stream<T> {
    if (this._next == null) {
      this._next = withIter(this._iter)
    }
    return this._next
  }
}
