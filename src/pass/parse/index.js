// @flow

import { T as AsyncStream, withIterable } from '~/data/stream-async'
import Syntax, * as syn from '~/data/pass/syntax'
import Lexicon, * as lex from '~/data/pass/lexer'
import Location from '~/data/location'
import { init } from '~/util/data'

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

async function parseCompoundExpression (initialState: State): Promise<ReadUpdate<Syntax>> {
  let { update: stateUpdate } = await skipWhiteSpace(initialState)
  const currentLexicon = await stateUpdate.current
  if (! (currentLexicon instanceof lex.LParenLexicon)) {
    throw unexpectedLexicon.call(stateUpdate, currentLexicon, lex.LParenLexicon)
  }

  // we need to forget the opening paren
  const startPos = stateUpdate.position
  stateUpdate = await stateUpdate.shiftForward()
  const subExpressions: Array<Syntax> = []

  while (true) {
    // storing the shifted state
    stateUpdate = (await skipWhiteSpace(stateUpdate)).update
    const token = await stateUpdate.current

    if (token instanceof lex.RParenLexicon) break
    let result = await parseExpression(stateUpdate)
    stateUpdate = result.update
    subExpressions.push(result.value)
  }

  // making sure not to forget the drop the closing paren
  const update = await stateUpdate.shiftForward()
  const location = init(Location, startPos, update.position)
  const value = init(syn.CompoundSyntax, location, subExpressions)
  return { update, value }
}

async function parseIdentifier (initialState: State): Promise<ReadUpdate<Syntax>> {
  let { update: stateUpdate } = await skipWhiteSpace(initialState)
  const token = await stateUpdate.current

  if (! (token instanceof lex.IdentifierLexicon)) {
    throw unexpectedLexicon.call(stateUpdate, token, lex.IdentifierLexicon)
  }

  return {
    // make sure if forgets about this token
    update: await stateUpdate.shiftForward(),
    value: init(syn.IdentiferSyntax, token.location, token.identifier),
  }
}

async function parseString (initialState: State): Promise<ReadUpdate<Syntax>> {
  let { update: stateUpdate } = await skipWhiteSpace(initialState)
  const token = await stateUpdate.current

  if (! (token instanceof lex.StringLexicon)) {
    throw unexpectedLexicon.call(stateUpdate, token, lex.IdentifierLexicon)
  }

  return {
    // make sure if forgets about this token
    update: await stateUpdate.shiftForward(),
    value: init(syn.StringSyntax, token.location, token.contents),
  }
}
