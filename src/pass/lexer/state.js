// @flow

import type Lexicon from '@/data/lex-token'
import type { Maybe } from '@/data/maybe'
import * as maybe from '@/data/maybe'
import { Stream, ContStream } from '@/core/stream'
import { Location, Position } from '@/data/location'
import { init, set } from '@/core'


type Input = Stream<string>
export type StateProcess = Generator<Lexicon, State, State>
export type StateBranch = (char: string, state: State) => StateProcess

/**
 * Functional representation of state
 */
export default class State {
  _stream: Input
  _branch: StateBranch
  _buffer: string
  _bufStart: Position
  _bufEnd: Position

  constructor (branch: StateBranch, stream: Input) {
    this._stream = stream
    this._branch = branch
    this._buffer = ''
    this._bufStart = this._bufEnd = Position.init()
  }

  get enqueued (): string {
    return this._buffer
  }

  get location (): Location {
    return Location.create(this._bufStart, this._bufEnd)
  }

  get current (): Maybe<string> {
    return this._stream instanceof ContStream
       ? maybe.just(this._stream.value)
       : maybe.none()
  }

  dropBuffer (): State {
    const _buffer = ''
    const _bufStart = this._bufEnd
    return set(this, { _buffer, _bufStart })
  }

  withBranch (character: string): StateProcess {
    return this._branch(character, this)
  }

  shiftForward (): State {
    const _stream = this._stream.shiftForward()
    if (this._stream instanceof ContStream) {
      const _buffer = this._buffer + this._stream.value
      const _bufEnd = this._bufEnd.shiftWith(this._stream.value)
      return set(this, { _stream, _bufEnd, _buffer })
    }
    else {
      return this
    }
  }

  setBranch (_branch: StateBranch): State {
    return set(this, { _branch })
  }

  static create (stream: Input, branch: StateBranch): State {
    return init(State, branch, stream)
  }
}
