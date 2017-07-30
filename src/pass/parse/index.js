// @flow

import { T as AsyncStream, withIterable } from '~/data/stream-async'
import Syntax, * as syn from '~/data/pass/syntax'
import Lexicon, * as lex from '~/data/pass/lexer'
import Location from '~/data/location'
import * as error from '~/data/error/parse'
import {
  init,
  iterateAsAsync,
  asAsyncIterable,
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


type ParamSource = AsyncIterable<AsyncIterable<Lexicon>>
type InternalSource = AsyncIterator<AsyncIterable<Lexicon>>

// $FlowTodo I don't really know what's wrong with this code...
export function asyncStateMachine (_state: State, input: ParamSource): AsyncGenerator<Syntax, State, void> {
  return (async function* implementation (state: State, iterator: InternalSource): AsyncGenerator<Syntax, State, void> {
    const { done, value } = await iterator.next()

    if (done) return state
    else if (value == null) {
      throw new error.ImpossibleError()
    }

    const iterable: AsyncIterable<Lexicon> = asAsyncIterable(value)
    const stream: AsyncStream<Lexicon> = withIterable(iterable)
    const updated: State = yield * loop(state.addInput(stream))
    return yield * implementation(updated, iterator)
  }(_state, iterateAsAsync(input)))
}

async function* loop (state: State): AsyncGenerator<Syntax, State, void> {
  if (await state.isEmpty()) return state
  const { value: expresssion, update } = await parseExpression(state)
  yield expresssion
  return yield * loop(update)
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
