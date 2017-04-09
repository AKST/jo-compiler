// @flow

type JSONShape = {
  meta: { code: Array<string>, message: string },
  data?: Object,
}

export default class JoError {
  code: Array<string>
  message: string

  constructor (code: Array<string>, message: string) {
    this.message = message
    this.code = code
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
}

export class Unimplemented extends JoError {
  reason: string

  constructor (reason: string) {
    super(['missing-feature'], `Internal error failed because '${reason}'`)
    this.reason = reason
  }
}
