// @flow
import type Location from '@/data/location'

export default class Token {
  location: Location

  constructor (location: Location) {
    this.location = location
  }

  toString (): string {
    throw new TypeError('abstract method')
  }
}

export class WhiteSpaceToken extends Token {
  number: number

  constructor (size: number, location: Location) {
    super(location)
    this.number = size
  }

  toString (): string {
    return `WhiteSpaceToken { number: ${this.number} }`
  }
}

export const BaseToken = Token
