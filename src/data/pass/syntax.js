// @flow
import { T as AsyncStream } from '@/data/stream-async'

export class Syntax {

}

export class Module {
  _topLevelSyntax: AsyncStream<Syntax>

  constructor (topLevelSyntax: AsyncStream<Syntax>) {
    this._topLevelSyntax = topLevelSyntax
  }
}

export default Syntax
