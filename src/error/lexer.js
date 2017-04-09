// @flow
import JoError from '@/error'

export default class TokenError extends JoError {}

export class UnexpectedChar extends TokenError {
  character: string;

  constructor (character: string) {
    super(['lexer', 'unexpected-char'], `Unexpected character '${character}`)
    this.character = character
  }
}

export class EmptyInputError extends TokenError {
  constructor () {
    super(['lexer', 'empty-input'], 'input was unexpectedly null')
  }
}
