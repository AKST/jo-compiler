// @flow
import ParseError, * as parseErrors from '@/data/error/parse'
import Syntax from '@/data/pass/syntax'
import Lexicon, * as lex from '@/data/pass/lexer'
import State from './-state'
import type { Position } from '@/data/location'

export type ReadUpdate<T> = { value: T, update: State }
export type Parser<T> = (state: State) => Promise<ReadUpdate<T>>
export type Reader = Parser<Syntax>

/**
 * With a reader function, it'll iterate through the options,
 * before returning a options, or throwing an exception to mark
 * failure.
 *
 * @param choices - The choices that can be returned from this function.
 */
export function choiceOf (...choices: Array<Reader>): Reader {
  return async function (state: State) {
    const startPos: Position = state.position
    let currentError: ?ParseError = null

    for (const choice of choices) {
      try {
        return await choice(state)
      }
      catch (error) {
        if (! (error instanceof ParseError)) throw error
        currentError = parseErrors.deepestError(currentError, error)
      }
    }

    throw (currentError || state.createError(parseErrors.ImpossibleError))
      .setStartPosition(startPos)
  }
}


/**
 * @param afterWhitespace - A syntax parser that will run after whitespace is gone.
 */
export function skipWhiteSpace <T> (afterWhitespace: Parser<T>): Parser<T> {
  return async function (state: State): Promise<ReadUpdate<T>> {
    let updatedState = state

    while (true) {
      const currentLexicon = await updatedState.current
      if (! (currentLexicon instanceof lex.WhiteSpaceLexicon)) break
      updatedState = await updatedState.shiftForward()
    }

    return afterWhitespace(updatedState)
  }
}

export function unexpectedFinish (state: State): ParseError {
  return state.createError(parseErrors.UnexpectedFinish)
}

export function unacceptable (state: State, lexicon: Lexicon): ParseError {
  return state.createError(parseErrors.UnexpectedLexicon, lexicon)
}

