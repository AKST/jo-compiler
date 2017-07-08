// @flow
import type Location from '@/data/location'
import { notImplemented } from '@/util/debug'

type LexiconJSON = { type: string, location: Location, repr?: Object }

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

  @notImplemented('required in sub type')
  get __repr (): ?Object {
    throw new TypeError()
  }

  toJSON (): LexiconJSON {
    const base: LexiconJSON = { type: this.kind, location: this.location }
    const repr = this.__repr

    if (repr != null) {
      base.repr = repr
    }

    return base
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

  get __repr (): ?Object {
    return null
  }

  toString (): string {
    return `LParenLexicon {}`
  }
}

/**
 * Lexical token that represent an closing paren
 */
export class RParenLexicon extends Lexicon {
  constructor (location: Location) {
    super(location, 'right-paren')
  }

  get __repr (): ?Object {
    return null
  }

  toString (): string {
    return `RParenLexicon {}`
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

  get __repr (): Object {
    return { name: this.identifier }
  }

  toString (): string {
    return `IdentifierLexicon { identifier: '${this.identifier}' }`
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

  get __repr (): Object {
    return { body: this.contents }
  }

  toString (): string {
    return `StringLexicon { content: '${this.contents}' }`
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

  get __repr (): Object {
    return { size: this.length }
  }

  toString (): string {
    return `WhiteSpaceLexicon { length: ${this.length} }`
  }
}

export const BaseLexicon = Lexicon
