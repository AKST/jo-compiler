// @flow
import { init, set } from '~/util/data'
import Comparison from '~/data/comparison'


export class Position {
  line: number
  column: number

  constructor (line: number, column: number) {
    this.line = line
    this.column = column
  }

  shiftWith (character: string): Position {
    if (character === '\n') {
      const line = this.line + 1
      const column = 1
      return set(this, { line, column })
    }
    else {
      const column = this.column + 1
      return set(this, { column })
    }
  }

  compare (other: Position): Comparison {
    const lineDiff = this.line - other.line
    const colDiff = this.column - other.column
    if (this.line > other.line) return init(Comparison, lineDiff)
    if (this.line < other.line) return init(Comparison, lineDiff)
    if (this.column > other.column) return init(Comparison, colDiff)
    if (other.column > this.column) return init(Comparison, colDiff)
    return init(Comparison, 0)
  }

  static init (): Position {
    return init(Position, 1, 1)
  }
}

export class Location {
  start: Position
  end: Position

  constructor (start: Position, end: Position) {
    this.start = start
    this.end = end
  }

  shiftEndColumnBack (): Location {
    const column = this.end.column - 1
    if (column > 0) {
      const e = init(Position, this.end.line, column)
      return init(Location, this.start, e)
    }
    throw new TypeError('cannot back on column')
  }

  static init (): Location {
    const s = Position.init()
    const e = Position.init()
    return init(Location, s, e)
  }

  static create (s: Position, e: Position): Location {
    return init(Location, s, e)
  }
}

export default Location
