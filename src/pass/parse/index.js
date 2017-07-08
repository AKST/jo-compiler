// @flow

// import * as parseErrors from '@/data/error/parse'
import { T as AsyncStream, withIterable } from '@/data/stream-async'
import { Unimplemented } from '@/data/error'
import Syntax, * as syn from '@/data/pass/syntax'
import Lexicon, * as lex from '@/data/pass/lexer'

import type { ReadUpdate, Reader } from './-util'
import State from './-state'
import {
  choiceOf,
  skipWhiteSpace,
  unexpectedLexicon,
} from './-util'


export function syntaxStream (tokens: AsyncStream<Lexicon>): AsyncStream<Syntax> {
  return withIterable(streamSyntax(State.create(tokens)))
}

async function* streamSyntax (state: State): AsyncIterator<Syntax> {
  if (await state.isEmpty()) return
  const { value: expresssion, update } = await parseExpression(state)
  yield expresssion
  yield * streamSyntax(update)
}

const parseExpression: Reader = choiceOf(
  parseIdentifier,
  parseString,
  parseCompoundExpression,
)

async function parseCompoundExpression (state: State): Promise<ReadUpdate<Syntax>> {
  let { update: stateUpdate } = await skipWhiteSpace(state)
  const currentLexicon = await stateUpdate.current
  if (! (currentLexicon instanceof lex.LParenLexicon)) {
    throw unexpectedLexicon.call(stateUpdate, currentLexicon, lex.LParenLexicon)
  }

  // we need to forget the opening paren
  stateUpdate = await stateUpdate.shiftForward()
  const subExpressions: Array<Syntax> = []

  while (true) {
    stateUpdate = (await skipWhiteSpace(stateUpdate)).update
    const token = await stateUpdate.current

    if (token.value instanceof lex.RParenLexicon) break
    let result = await parseExpression(stateUpdate)
    stateUpdate = result.update
    subExpressions.push(result.value)
  }

  throw new Unimplemented('nextCompoundExpression')
}

async function parseIdentifier (state: State): Promise<ReadUpdate<Syntax>> {
  let { update: stateUpdate } = await skipWhiteSpace(state)
  const token = await stateUpdate.current

  if (! (token instanceof lex.IdentifierLexicon)) {
    throw unexpectedLexicon.call(stateUpdate, token, lex.IdentifierLexicon)
  }

  return {
    // make sure if forgets about this token
    update: await stateUpdate.shiftForward(),
    value: new syn.IdentiferSyntax(token.identifier),
  }
}

async function parseString (state: State): Promise<ReadUpdate<Syntax>> {
  let { update: stateUpdate } = await skipWhiteSpace(state)
  const token = await stateUpdate.current

  if (! (token instanceof lex.StringLexicon)) {
    throw unexpectedLexicon.call(stateUpdate, token, lex.IdentifierLexicon)
  }

  return {
    // make sure if forgets about this token
    update: await stateUpdate.shiftForward(),
    value: new syn.StringSyntax(token.contents),
  }
}
