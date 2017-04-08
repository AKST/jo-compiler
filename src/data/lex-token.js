// @flow
import type Location from '@/data/location'

/**
 * Base class for lexical tokens
 */
export default class Lexicon {
  location: Location
  kind: string

  constructor (location: Location, kind: string) {
    this.location = location
    this.kind = kind
  }

  toString (): string {
    throw new TypeError('abstract method')
  }
}

/**
 * Lexical token that represent an opening paren
 */
export class LParenLexicon extends Lexicon {
  constructor (location: Location) {
    super(location, 'left-paren')
  }

  toString (): string {
    return `LParenLexicon { }`
  }
}

/**
 * Lexical token that represent an closing paren
 */
export class RParenLexicon extends Lexicon {
  constructor (location: Location) {
    super(location, 'right-paren')
  }

  toString (): string {
    return `RParenLexicon { }`
  }
}

/**
 * Lexical token that represents an identifier
 */
export class IdentifierLexicon extends Lexicon {
  identifier: string

  constructor (identifier: string, location: Location) {
    super(location, 'identifier')
    this.identifier = identifier
  }

  toString (): string {
    return `IdentifierLexicon { identifier = '${this.identifier}' }`
  }
}

/**
 * Lexical token that represents a normal string
 */
export class StringLexicon extends Lexicon {
  contents: string

  constructor (contents: string, location: Location) {
    super(location, 'string')
    this.contents = contents
  }

  toString (): string {
    return `PlainStringLexicon { content = '${this.contents}' }`
  }
}

/**
 * Lexical token that represents whitespace
 */
export class WhiteSpaceLexicon extends Lexicon {
  length: number

  constructor (length: number, location: Location) {
    super(location, 'whitespace')
    this.length = length
  }

  toString (): string {
    return `WhiteSpaceLexicon { length: ${this.length} }`
  }
}

export const BaseLexicon = Lexicon
