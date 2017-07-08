// @flow
export class Syntax {

}

export class CompoundSyntax extends Syntax {
  items: Array<Syntax>

  constructor (items: Array<Syntax>) {
    super()
    this.items = items
  }
}

export class IdentiferSyntax extends Syntax {
  identifier: string

  constructor (value: string) {
    super()
    this.identifier = value
  }
}

export class StringSyntax extends Syntax {
  contents: string

  constructor (value: string) {
    super()
    this.contents = value
  }
}

export default Syntax
