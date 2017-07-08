// @flow
export class Syntax {

}

export class CompoundExpression extends Syntax {
  items: Array<Syntax>

  constructor (items: Array<Syntax>) {
    super()
    this.items = items
  }
}

export default Syntax
