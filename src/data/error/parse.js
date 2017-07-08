// @flow
import JoError from '@/data/error'
import Lexicon from '@/data/pass/lexer'
import type { Position } from '@/data/location'

export function deepestError (a: ?SyntaxError, b: ?SyntaxError): ?SyntaxError {
  if (a == null) return b
  if (b == null) return a
  const aEnd: ?Position = a.endPosition
  const bEnd: ?Position = b.endPosition
  if (aEnd == null) return b
  if (bEnd == null) return a
  return aEnd.compare(bEnd).isGreater() ? a : b
}

export default class SyntaxError extends JoError {
  _startPos: ?Position
  _endPos: ?Position

  constructor (message: string, startPosition: ?Position, endPosition: ?Position) {
    super(['parse'], message)
    this._startPos = startPosition
    this._endPos = endPosition
  }

  get startPosition (): ?Position {
    return this._startPos
  }

  get endPosition (): ?Position {
    return this._endPos
  }

  setStartPosition (position: Position): SyntaxError {
    this._startPos = position
    return this
  }

  setEndPosition (position: Position): SyntaxError {
    this._endPos = position
    return this
  }
}

export class UnexpectedLexicon extends SyntaxError {
  encounted: Lexicon
  expected: Class<Lexicon>

  constructor (encounted: Lexicon, expected: Class<Lexicon>) {
    super(`Encounted '${encounted.kind}', expected ${expected.name}`)
    this.encounted = encounted
    this.expected = expected
  }
}

export class UnexpectedFinish extends SyntaxError {
  constructor () {
    super('finished eariler than expected')
  }
}

export class ImpossibleError extends SyntaxError {
  constructor () {
    super('an "impossible" error has occured, congrats you broke the universe')
  }
}
