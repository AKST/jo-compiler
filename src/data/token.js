// @flow
import type Location from '@/data/location'

export default class Token {
  location: Location

  constructor (location: Location) {
    this.location = location
  }

  toString (): string {
    throw new TypeError('abstract method')
  }
}

/**
 * Token that represent an opening paren
 */
export class LParen extends Token {
  toString (): string {
    return `token::LParen { }`
  }
}

/**
 * Token that represent an closing paren
 */
export class RParen extends Token {
  toString (): string {
    return `token::RParen { }`
  }
}

/**
 * Token that represents an identifier
 */
export class Identifier extends Token {
  identifier: string

  constructor (identifier: string, location: Location) {
    super(location)
    this.identifier = identifier
  }

  toString (): string {
    return `token::Identifier { identifier = "${this.identifier}" }`
  }
}

/**
 * Token that represents a normal string
 */
export class PlainString extends Token {
  contents: string

  constructor (contents: string, location: Location) {
    super(location)
    this.contents = contents
  }

  toString (): string {
    return `token::PlainString { content = "${this.contents}" }`
  }
}

/**
 * Token that represents whitespace
 */
export class WhiteSpace extends Token {
  number: number

  constructor (size: number, location: Location) {
    super(location)
    this.number = size
  }

  toString (): string {
    return `token::WhiteSpace { number: ${this.number} }`
  }
}

export const BaseToken = Token
