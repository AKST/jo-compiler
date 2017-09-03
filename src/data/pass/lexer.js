// @flow
import type Location from '~/data/location'
import { notImplemented } from '~/util/debug'

type LexiconJSON = { type: string, location: Location, repr?: Object }

/**
 * Base class for lexical tokens
 */
export default class Lexicon {
  location: Location

  constructor (location: Location) {
    this.location = location
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

  get kind (): string {
    // $FlowTodo, this can be ignored
    const type: string = this.constructor.kind
    return type
  }
}

/**
 * Lexical token that represent an opening paren
 */
export class LParenLexicon extends Lexicon {
  static kind: string = 'left-paren'

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
  static kind: string = 'right-paren'

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
  static kind: string = 'identifier'
  identifier: string

  constructor (identifier: string, location: Location) {
    super(location)
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
  static kind: string = 'string'
  contents: string

  constructor (contents: string, location: Location) {
    super(location)
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
 * Lexicon token that represents an integer
 */
export class IntegerLexicon extends Lexicon {
  static kind: string = 'interger'
  value: number

  constructor (value: number, location: Location) {
    super(location)
    this.value = value
  }

  get __repr (): Object {
    return { value: this.value }
  }

  toString (): string {
    return `IntegerLexicon { value: ${this.value} }`
  }
}

/**
 * Lexical token that represents whitespace
 */
export class WhiteSpaceLexicon extends Lexicon {
  static kind: string = 'whitespace'
  length: number

  constructor (length: number, location: Location) {
    super(location)
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
