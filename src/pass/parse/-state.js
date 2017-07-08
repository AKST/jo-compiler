// @flow
import { T as AsyncStream } from '@/data/stream-async'
import { Position } from '@/data/location'

import ParseError, * as parseErrors from '@/data/error/parse'
import Lexicon from '@/data/pass/lexer'
import { init } from '@/util/data'

export type Input = AsyncStream<Lexicon>

export default class State {
  _input: Input
  _currentPosition: Position

  constructor (input: Input, position: Position = Position.init()) {
    this._input = input
    this._currentPosition = position
  }

  createError <T: ParseError> (C: Class<T>, ...args: Array<any>): ParseError {
    const error: ParseError = new C(...args)
    return error.setEndPosition(this._currentPosition)
  }

  async isEmpty (): Promise<boolean> {
    return this._input.done
  }

  async shiftForward (): Promise<State> {
    const nextInput = await this._input.shiftForward()
    const position = (await this.current).location.end
    return init(State, nextInput, position)
  }

  get current (): Promise<Lexicon> {
    return this._input.current().then(maybe => {
      if (maybe.kind === 'just') return maybe.value
      return Promise.reject(this.createError(parseErrors.UnexpectedFinish))
    })
  }

  get position (): Position {
    return this._currentPosition
  }

  static create (input: Input) {
    return init(State, input)
  }
}
