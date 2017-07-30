// @flow

import { T as AsyncStream, withIterable } from '~/data/stream-async'
import Syntax, * as syn from '~/data/pass/syntax'
import Lexicon, * as lex from '~/data/pass/lexer'
import Location from '~/data/location'
import * as error from '~/data/error/parse'
import { Unimplemented } from '~/data/error'
import {
  init,
  iterateAsAsync,
} from '~/util/data'

import type { ReadUpdate, Reader } from './-util'
import State from './-state'
import {
  choiceOf,
  skipWhiteSpace,
  unexpectedLexicon,
} from './-util'

export type { Syntax as Data, State }



export function initialState (): State {
  return State.create(withIterable())
}

/**
 * Generates a stream of syntax trees from a stream of lexicons.
 *
 * @param tokens - A stream of lexicons.
 * @returns An immutable async stream of syntax trees.
 */
export function syntaxStream (tokens: AsyncIterable<Lexicon>): AsyncStream<Syntax> {
  return withIterable(asyncStateMachine(initialState(), [tokens]))
}


type _Iterable<T> = AsyncIterable<T> | Iterable<T>
type _Iterator<T> = AsyncIterator<T> | Iterator<T>

type ParamSource = _Iterable<_Iterable<Lexicon>>
type InternalSource = _Iterator<_Iterable<Lexicon>>

export function asyncStateMachine (_state: State, input: ParamSource): AsyncGenerator<Syntax, State, void> {
  return (async function* implementation (state: State, iterator: InternalSource): AsyncGenerator<Syntax, State, void> {
    const { done, value } = await iterator.next()

    if (! done && value == null) {
      throw new error.ImpossibleError()
    }
    else if (! done && value != null) {
      const stream = withIterable(iterateAsAsync(value))
      const updated: State = yield * streamSyntax(state.addInput(stream))
      return yield * implementation(updated, iterator)
    }
    return state
  }(_state, iterateAsAsync(input)))
}

async function* streamSyntax (state: State): AsyncGenerator<Syntax, State, void> {
  if (await state.isEmpty()) return state
  const { value: expresssion, update } = await parseExpression(state)
  yield expresssion
  return yield * streamSyntax(update)
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
