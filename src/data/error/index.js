// @flow
import { getStack } from './-util'

type JSONShape = {
  meta: { code: Array<string>, message: string },
  data?: Object,
}

export default class JoError {
  /**
   * Think of code as meta data tags associted with the
   * reason for the code failing.
   */
  code: Array<string>

  /**
   * Stack trace
   */
  stack: Array<string>

  /**
   * Friendly error message intended for project maintainer
   */
  message: string

  constructor (code: Array<string>, message: string) {
    this.message = message
    this.code = code
    this.stack = getStack(4)
  }

  /**
   * For serialising errors.
   *
   * @param indent - Whether or not to pretty print.
   */
  toJSON (indent: boolean): Object {
    const { code, message, ...other } = this
    const shape: JSONShape = { meta: { code, message } }

    if (Object.keys(other).length !== 0) {
      shape.data = other
    }

    return shape
  }

  toString () {
    const message = `message:\n  - ${this.message}`
    const stackTrace = `stack:\n${this.stack.join('\n')}`
    const metaData = `tags:${this.code.map(it => `\n  - ${it}`).join('')}`
    return `${metaData}\n${message}\n${stackTrace}`
  }
}

export class Unimplemented extends JoError {
  reason: string

  constructor (reason: string) {
    super(['missing-feature'], `Internal error failed because '${reason}'`)
    this.reason = reason
  }
}
