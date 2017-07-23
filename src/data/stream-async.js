// @flow
import type { Maybe } from '~/data/maybe'
import { just, none } from '~/data/maybe'

export function withIterable<T> (iterable: AsyncIterable<T>): AsyncStream<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/1163
  return _withIter(iterable[Symbol.asyncIterator]())
}

export function withGenerator<T> (iterable: AsyncGenerator<T, any, any>): AsyncStream<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/1163
  return _withIter(iterable[Symbol.asyncIterator]())
}

function _withIter<T> (iterator: AsyncGenerator<T, any, any>, extention: ?AsyncStream<T>): AsyncStream<T> {
  return new AsyncStream(iterator, extention)
}

// interal state of the stream
type Current<T> = { kind: 'deferred' }
                | { kind: 'error', error: Error }
                | { kind: 'finished' }
                | { kind: 'has-more', value: T }

/**
 * Since the links of the stream are likely to
 * touch alot of things it's wise to store the
 * state of the links here so the garbage
 * collector has an easier time freein these.
 */
type StreamState<T> = {
  /**
   * This will only be calculated once!
   *
   * @access private
   */
  current: Current<T>,

  /**
   * This will only be calculated once!
   *
   * @access private
   */
  next: ?AsyncStream<T>,

  /**
   *
   * @access private
   */
  +iter: AsyncGenerator<T, any, any>,

  /**
   * @access private
   */
  +extention: ?AsyncStream<T>,
}

const instances: WeakMap<AsyncStream<any>, StreamState<any>> = new WeakMap()

/**
 * A wrapper function around the state of a stream.
 *
 * @param stream - The stream used to lookup a piece of state.
 *
 * @returns The state associated with a stream.
 *
 * @access private
 */
function getState<T> (stream: AsyncStream<T>): StreamState<T> {
  const result = instances.get(stream)
  if (result == null) throw new TypeError()
  return (result: StreamState<T>)
}

/**
 * A functional wrapper around the imparitive type AsyncIterator.
 *
 * @access public
 */
export class AsyncStream<T> {
  constructor (iterator: AsyncGenerator<T, any, any>, extention: ?AsyncStream<T>) {
    instances.set(this, {
      current: { kind: 'deferred' },
      next: null,
      iter: iterator,
      extention,
    })
  }

  /**
   * @access private
   */
  async __computed (): Promise<Maybe<T>> {
    const self = getState(this)
    switch (self.current.kind) {
      // if defered we'll calculate the result and
      // recall outselves and let a recursive call
      // take care of the result.
      case 'deferred': {
        try {
          const { value, done } = await self.iter.next()

          if (done) {
            self.current = { kind: 'finished' }
          }
          else if (! done && value == null) {
            const error = new TypeError('unexpected end')
            self.current = { kind: 'error', error }
          }
          else if (value != null) {
            self.current = { kind: 'has-more', value }
            self.next = _withIter(self.iter, self.extention)
          }
        }
        catch (error) {
          self.current = { kind: 'error', error }
        }
        return this.__computed()
      }
      case 'has-more': {
        return just(self.current.value)
      }
      case 'finished': {
        return none()
      }
      case 'error': {
        throw self.current.error
      }
      default:
        const error = new TypeError('unknown state')
        self.current = { kind: 'error', error }
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
    const self = getState(this)
    const result = await this.__computed()
    if (result.kind === 'none' && self.extention != null) {
      return self.extention.__focusOn()
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
    const self = getState(this)
    // it's important we copy over the val
    if (self.extention == null) {
      const result = new AsyncStream(self.iter, extention)
      const child = getState(result)
      child.current = self.current
      child.next = self.next
      return result
    }
    else {
      const result = new AsyncStream(self.iter, self.extention.extend(extention))
      const child = getState(result)
      child.current = self.current
      child.next = self.next
      return result
    }
  }

  /**
   * Returns the next link in the iterator stream.
   */
  async shiftForward (): Promise<AsyncStream<T>> {
    const instance: AsyncStream<T> = await this.__focusOn()
    const self: StreamState<T> = getState(instance)
    return self.next == null ? instance : self.next
  }

  /*::
  @@asyncIterator(): AsyncIterator<T> {
    throw new Error()
  }*/

  /**
   * An iterator for the stream
   */
  // $FlowTodo: https://github.com/facebook/flow/issues/2286
  async * [Symbol.asyncIterator] (): AsyncIterator<T> {
    let self = this
    while (true) {
      const result = await self.current()
      if (result.kind !== 'just') break
      yield result.value
      self = await self.shiftForward()
    }
  }
}

/**
 * @access private
 */
export const T = AsyncStream
