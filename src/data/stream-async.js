// @flow
import type { Maybe } from '@/data/maybe'
import { just, none } from '@/data/maybe'

export function withIterable<T> (iterable: AsyncIterable<T>): AsyncStream<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/1163
  return _withIter(iterable[Symbol.asyncIterator]())
}


function _withIter<T> (iterator: AsyncIterator<T>, extention: ?AsyncStream<T>): AsyncStream<T> {
  return new AsyncStream(iterator, extention)
}

// interal state of the stream
type Current<T> = { kind: 'deferred' }
                | { kind: 'error', error: Error }
                | { kind: 'finished' }
                | { kind: 'has-more', value: T }


/**
 * A functional wrapper around the imparitive type AsyncIterator.
 *
 * @access public
 */
export class AsyncStream<T> {
  /**
   * This will only be calculated once!
   *
   * @access private
   */
  _current: Current<T>

  /**
   * This will only be calculated once!
   *
   * @access private
   */
  _next: ?AsyncStream<T>

  /**
   *
   * @access private
   */
  _iter: AsyncIterator<T>

  /**
   * @access private
   */
  _extention: ?AsyncStream<T>

  constructor (iterator: AsyncIterator<T>, extention: ?AsyncStream<T>) {
    this._current = { kind: 'deferred' }
    this._next = null

    Object.defineProperty(this, '_iter', { writeable: false, value: iterator })
    Object.defineProperty(this, '_extention', { writeable: false, value: extention })
  }

  /**
   * @access private
   */
  async __computed (): Promise<Maybe<T>> {
    switch (this._current.kind) {
      // if defered we'll calculate the result and
      // recall outselves and let a recursive call
      // take care of the result.
      case 'deferred': {
        try {
          const { value, done } = await this._iter.next()

          if (done) {
            this._current = { kind: 'finished' }
          }
          else if (! done && value == null) {
            const error = new TypeError('unexpected end')
            this._current = { kind: 'error', error }
          }
          else if (value != null) {
            this._current = { kind: 'has-more', value }
            this._next = _withIter(this._iter, this._extention)
          }
        }
        catch (error) {
          this._current = { kind: 'error', error }
        }
        return this.__computed()
      }
      case 'has-more': {
        return just(this._current.value)
      }
      case 'finished': {
        return none()
      }
      case 'error': {
        throw this._current.error
      }
      default:
        const error = new TypeError('unknown state')
        this._current = { kind: 'error', error }
        return this.__computed()
    }
  }

  /**
   * If the current link is empty but there's an
   * extention then focus on that next, if the there
   * is neither an extention or the current link isn't
   * empty, then focus on self.
   *
   * @access private
   */
  async __focusOn (): Promise<AsyncStream<T>> {
    const result = await this.__computed()
    if (result.kind === 'none' && this._extention != null) {
      return this._extention.__focusOn()
    }
    return this
  }

  get done (): Promise<boolean> {
    return this.__focusOn()
      .then(stream => stream.__computed())
      .then(result => result.kind === 'none')
  }

  current (): Promise<Maybe<T>> {
    return this.__focusOn().then(stream => stream.__computed())
  }

  extend (extention: AsyncStream<T>): AsyncStream<T> {
    // it's important we copy over the val
    if (this._extention == null) {
      const result = new AsyncStream(this._iter, extention)
      result._current = this._current
      result._next = this._next
      return result
    }
    else {
      const result = new AsyncStream(this._iter, this._extention.extend(extention))
      result._current = this._current
      result._next = this._next
      return result
    }
  }

  /**
   * Returns the next link in the iterator stream.
   */
  async shiftForward (): Promise<AsyncStream<T>> {
    const self = await this.__focusOn()
    return self._next == null ? self : self._next
  }
}

/**
 * @access private
 */
export const T = AsyncStream
