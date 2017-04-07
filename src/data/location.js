// @flow
import { init, set } from '@/core'

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
