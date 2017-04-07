// @flow
import type Location from '@/data/location'

/**
 * Base class for lexical tokens
 */
export default class Lexicon {
  location: Location

  constructor (location: Location) {
    this.location = location
  }

  toString (): string {
    throw new TypeError('abstract method')
  }
}

/**
 * Lexical token that represent an opening paren
 */
export class LParenLexicon extends Lexicon {
  toString (): string {
    return `LParenLexicon { }`
  }
}

/**
 * Lexical token that represent an closing paren
 */
export class RParenLexicon extends Lexicon {
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
    super(location)
    this.identifier = identifier
  }

  toString (): string {
    return `IdentifierLexicon { identifier = "${this.identifier}" }`
  }
}

/**
 * Lexical token that represents a normal string
 */
export class PlainStringLexicon extends Lexicon {
  contents: string

  constructor (contents: string, location: Location) {
    super(location)
    this.contents = contents
  }

  toString (): string {
    return `PlainStringLexicon { content = "${this.contents}" }`
  }
}

/**
 * Lexical token that represents whitespace
 */
export class WhiteSpaceLexicon extends Lexicon {
  number: number

  constructor (size: number, location: Location) {
    super(location)
    this.number = size
  }

  toString (): string {
    return `WhiteSpaceLexicon { number: ${this.number} }`
  }
}

export const BaseLexicon = Lexicon
