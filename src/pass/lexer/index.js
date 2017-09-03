// @flow
import type Token from '~/data/pass/lexer'
import type { StateProcess } from '~/pass/lexer/-state'

import { withIterable as initSyncStream, T as SyncStream } from '~/data/reactive/stream-sync'
import { withGenerator as initAsyncStream, T as AsyncStream } from '~/data/reactive/stream-async'
import * as tokens from '~/data/pass/lexer'
import {
  init,
  iterateAsAsync,
} from '~/util/data'
import * as error from '~/data/error/lexer'
import State from '~/pass/lexer/-state'

export type { State, Token as Data }

/**
 * Makes a piece of state that can be consumed
 * functions exported by this module.
 */
export function initialState (): State {
  return State.create(initSyncStream(), branchInit)
}

/**
 * Main entry point of the module, basically consumes the input from
 * the stream, until it reaches the end of the stream.
 *
 * @param input - A stream of strings.
 * @returns An immutable async stream of Tokens.
 */
export function tokenStream (input: AsyncIterable<string>): AsyncStream<Token> {
  return initAsyncStream(asyncStateMachine(initialState(), input))
}

type Source<T> = Iterable<T> | AsyncIterable<T>

/**
 * This can be paused and resumed, to continue pause and
 * resume the process of lexing.
 *
 * @access public
 * @param _state - The lexer state.
 * @param iterable - An iterator for the state of the lexer.
 */
export function asyncStateMachine (_state: State, iterable: Source<string>): AsyncGenerator<Token, State, void> {
  return (async function* implementation (state: State, iterator: AsyncIterator<string>): AsyncGenerator<Token, State, void> {
    const { done, value } = await iterator.next()

    if (! done && value == null) {
      throw new error.EmptyInputError()
    }
    else if (! done) {
      const stream = initSyncStream(value)
      // $FlowTodo
      const update = yield * withState(state, stream)
      return yield * asyncStateMachine(update, iterator)
    }
    return state
  }(_state, iterateAsAsync(iterable)))
}

/**
 * Takes a stream and feed additional input into it.
 *
 * @param state - A stream of characters.
 *
 * @param stream - An optional parameter for taking left over state
 * for additional input.
 *
 * @returns An iterator that will yields lexical tokens for the
 * provided input, but all also return the state left over by
 * the iterator, which can be passed back into this function for
 * additional input.
 */
function withState (state: State, stream: SyncStream<string>): StateProcess {
  return loop(state.addInput(stream))
}

///////////////////////////////////////////////////////////

function* loop (state: State): StateProcess {
  const current = state.current
  if (current.kind === 'just') {
    const update = yield * state.withBranch(current.value)
    return yield * loop(update)
  }
  else {
    return state
  }
}

///////////////////////////////////////////////////////////

function* branchInit (character: string, state: State): StateProcess {
  if (isWhitespace(character)) {
    return state.setBranch(branchWS)
  }
  else if (isNumber(character)) {
    return state.shiftForward()
      .setBranch(branchInteger)
  }
  else if (isAlpha(character)) {
    return state.shiftForward()
      .setBranch(branchId)
  }
  else if (character === '"') {
    return state.shiftForward()
      .dropBuffer()
      .setBranch(branchString)
  }
  else if (character === ')') {
    const shifted = state.shiftForward()
    const location = shifted.location
    yield init(tokens.RParenLexicon, location)
    return shifted.dropBuffer()
  }
  else if (character === '(') {
    const shifted = state.shiftForward()
    const location = shifted.location
    yield init(tokens.LParenLexicon, location)
    return shifted.dropBuffer()
  }
  else {
    throw new error.UnexpectedChar(character)
  }
}

function* branchId (character: string, state: State): StateProcess {
  if (isIdChar(character)) {
    return state.shiftForward()
  }
  else {
    const repr = state.enqueued
    const location = state.location
    yield init(tokens.IdentifierLexicon, repr, location)
    return state.dropBuffer().setBranch(branchInit)
  }
}

function* branchInteger (character: string, state: State): StateProcess {
  if (isNumber(character)) {
    return state.shiftForward()
  }
  else {
    const value = parseInt(state.enqueued, 10)
    const location = state.location
    yield init(tokens.IntegerLexicon, value, location)
    return state.dropBuffer().setBranch(branchInit)
  }
}

function* branchString (character: string, state: State): StateProcess {
  if (character !== '"') {
    return state.shiftForward()
  }
  else {
    const content = state.enqueued
    const shifted = state.shiftForward()
    const location = shifted.location
    yield init(tokens.StringLexicon, content, location)
    return shifted.dropBuffer().setBranch(branchInit)
  }
}

function* branchWS (character: string, state: State): StateProcess {
  if (isWhitespace(character)) {
    return state.shiftForward()
  }
  else {
    const nchars = state.enqueued.length
    const lchars = state.location
    yield init(tokens.WhiteSpaceLexicon, nchars, lchars)
    return state.dropBuffer().setBranch(branchInit)
  }
}

///////////////////////////////////////////////////////////

function isNumber (character: string): boolean {
  return !! character.match(/^[0-9]$/)
}

function isAlpha (character: string): boolean {
  return !! character.match(/^[a-zA-Z]$/)
}

function isIdChar (character: string): boolean {
  return !! character.match(/^[a-zA-Z0-9-]$/)
}

function isWhitespace (character: string): boolean {
  return !! character.match(/(\s|\n|\t)/)
}
