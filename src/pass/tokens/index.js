// @flow
import type { Stream } from '@/core/stream'
import type { StateProcess } from '@/pass/tokens/state'
import * as error from '@/pass/tokens/error'
import State from '@/pass/tokens/state'
import * as tokens from '@/data/token'

/**
 * Main entry point of the module, basically consumes the input from
 * the stream, until it reaches the end of the stream.
 *
 * If there's more input just pass the state of the lexer back in and
 * it will continue lexing.
 */
export default function (stream: Stream<string>, state: ?State): StateProcess {
  return state == null
    ? loop(State.create(stream, branchInit))
    : loop(state)
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
    yield new tokens.RParen(location)
    return shifted.dropBuffer()
  }
  else if (character === '(') {
    const shifted = state.shiftForward()
    const location = shifted.location
    yield new tokens.LParen(location)
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
    yield new tokens.Identifier(repr, location)
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
    yield new tokens.PlainString(content, location)
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
    yield new tokens.WhiteSpace(nchars, lchars)
    return state.dropBuffer().setBranch(branchInit)
  }
}

///////////////////////////////////////////////////////////

function isAlpha (character: string): boolean {
  return !! character.match(/^[a-zA-Z]$/)
}

function isIdChar (character: string): boolean {
  return !! character.match(/^[a-zA-Z0-9-]$/)
}

function isWhitespace (character: string): boolean {
  return !! character.match(/(\s|\n|\t)/)
}
