// @flow
import JoError from '@/data/error'
import Lexicon from '@/data/pass/lexer'

export default class SyntaxError extends JoError {
  constructor (message: string) {
    super(['parse'], message)
  }
}

export class UnexpectedLexicon extends SyntaxError {
  encounted: Array<Lexicon>

  constructor (encounted: Array<Lexicon>) {
    super('encounted unexpcted tokens')
    this.encounted = encounted
  }
}
