// @flow

import * as parseErrors from '@/data/error/parse'
import { T as AsyncStream, withIterable } from '@/data/stream-async'
import { Unimplemented } from '@/data/error'
import Syntax from '@/data/pass/syntax'
import Lexicon, * as lex from '@/data/pass/lexer'

import type { ReadUpdate, Reader } from './-util'
import State from './-state'
import { choiceOf } from './-util'


export function syntaxStream (tokens: AsyncStream<Lexicon>): AsyncStream<Syntax> {
  return withIterable(streamSyntax(State.create(tokens)))
}

async function* streamSyntax (state: State): AsyncIterator<Syntax> {
  if (await state.isEmpty()) return
  const { value: expresssion, update } = await nextExpression(state)
  yield expresssion
  yield * streamSyntax(update)
}

const nextExpression: Reader = choiceOf(
  nextCompoundExpression,
)

async function nextCompoundExpression (state: State): Promise<ReadUpdate<Syntax>> {
  const currentLexicon = await state.current
  if (! (currentLexicon instanceof lex.LParenLexicon)) {
    throw state.createError(parseErrors.UnexpectedLexicon,
      currentLexicon,
      lex.LParenLexicon,
    )
  }

  let stateUpdate = state.shiftForward()
  throw new Unimplemented('nextCompoundExpression')
}
