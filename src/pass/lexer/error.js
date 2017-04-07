// @flow
export default class TokenError extends Error {}

export class UnexpectedChar extends TokenError {
  character: string;

  constructor (character: string) {
    super(`Unexpected character '${character}`)
    this.character = character
  }
}

export class EmptyInputError extends TokenError {
  constructor () {
    super('input was unexpectedly null')
  }
}
