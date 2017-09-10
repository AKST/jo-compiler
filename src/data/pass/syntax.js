// @flow
import type Location from '~/data/location'
import { notImplemented } from '~/util/debug'

type SyntaxJSON = { type: string, location: Location, repr?: Object }

export class Syntax {
  location: Location

  constructor (location: Location) {
    this.location = location
  }

  @notImplemented('required in sub type')
  get __repr (): ?Object {
    throw new TypeError()
  }

  toJSON (): SyntaxJSON {
    const base: SyntaxJSON = { type: this.kind, location: this.location }
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

export class CompoundSyntax extends Syntax {
  static kind: string = 'compound'
  children: Array<Syntax>

  constructor (location: Location, items: Array<Syntax>) {
    super(location)
    this.children = items
  }

  get __repr (): Object {
    return { children: this.children }
  }
}

export class IdentiferSyntax extends Syntax {
  static kind: string = 'identifier'
  identifier: string

  constructor (location: Location, value: string) {
    super(location)
    this.identifier = value
  }

  get __repr (): Object {
    return { identifier: this.identifier }
  }
}

export class IntegerSyntax extends Syntax {
  static kind: string = 'integer'
  value: number

  constructor (location: Location, value: number) {
    super(location)
    this.value = value
  }

  get __repr (): Object {
    return { value: this.value }
  }
}

export class FloatSyntax extends Syntax {
  static kind: string = 'float'
  value: number

  constructor (location: Location, value: number) {
    super(location)
    this.value = value
  }

  get __repr (): Object {
    return { value: this.value }
  }
}

export class StringSyntax extends Syntax {
  static kind: string = 'string'
  contents: string

  constructor (location: Location, value: string) {
    super(location)
    this.contents = value
  }

  get __repr (): Object {
    return { contents: this.contents }
  }
}

export default Syntax
