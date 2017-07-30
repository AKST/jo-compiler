// @flow
import EventEmitter from 'events'

import { Unimplemented } from '~/data/error'

type Task<R> = { cleanup (): void, promise: Promise<R> }


class Monitor<O, S> {
  _label: string
  _channel: AsyncGenerator<O, S, void>
  _result: Promise<void>

  constructor (label: string, result: Promise<void>, chan: AsyncGenerator<O, S, void>) {
    this._label = label
    this._result = result
    this._channel = chan
  }

  get channel (): AsyncGenerator<O, S, void> {
    return this._channel
  }
}

export function create<O, S> (generator: AsyncGenerator<O, S, any>, label: string): Monitor<O, S> {
  const emitter = new EventEmitter()

  const updates: AsyncGenerator<O, S, void> = (async function* () {
    while (true) {
      const aTask = awaitEvent(emitter, 'data')
      const bTask = awaitEvent(emitter, 'end')

      emitter.emit('unlock')

      const winner = await Promise.race([
        aTask.promise.then(a => ({ type: 'data', value: a })),
        bTask.promise.then(b => ({ type: 'end', value: b })),
      ])

      if (winner.type === 'end') {
        aTask.cleanup()
        return winner.value
      }
      else {
        bTask.cleanup()
        yield winner.value
      }
    }
    // eslint-disable-next-line no-unreachable
    throw new TypeError('impossible scearnio')
  }())

  const result = (async function () {
    while (true) {
      const unlock = awaitEvent(emitter, 'unlock')
      await unlock.promise

      const { done, value } = await generator.next()
      if (! done) {
        emitter.emit('data', value)
      }
      else {
        emitter.emit('end', value)
        return
      }
    }
    // eslint-disable-next-line no-unreachable
    throw new TypeError('impossible scearnio')
  }())

  return new Monitor(label, result, updates)
}

type Resolve<Y> = { yieldFrom: Monitor<Y, any>, getStatesOf: Array<Monitor<any, any>> }

export async function* resolve<Y> (target: Resolve<Y>): AsyncGenerator<Y, Object, void> {
  throw new Unimplemented('resolve')
}

///////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a promise that resolves when an event is emitted, along with a cleanup
 * function that is called if that promise is never fired.
 */
function awaitEvent<S> (e: EventEmitter, eventName: string): Task<S> {
  let _handle: ?Function = null

  const cleanup = () => {
    if (_handle != null) {
      e.removeListener(eventName, _handle)
      _handle = null
    }
  }

  const promise = new Promise((resolve, reject) => {
    _handle = (event) => {
      resolve(event)
      cleanup()
    }
    e.addListener(eventName, _handle)
  })

  return { cleanup, promise }
}
