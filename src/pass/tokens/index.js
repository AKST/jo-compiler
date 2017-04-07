// @flow
import type { Stream } from '@/core/stream'
import type { StateProcess } from '@/pass/tokens/state'
import * as error from '@/pass/tokens/error'
import State from '@/pass/tokens/state'
import * as tokens from '@/data/token'

/**
 * Takes a stream and consumes the characters
 */
export default function (stream: Stream<string>): StateProcess {
  return impl(State.create(stream, branchInit))
}

///////////////////////////////////////////////////////////


function* impl (state: State): StateProcess {
  const current = state.current
  if (current.kind === 'just') {
    const update = yield * state.withBranch(current.value)
    return yield * impl(update)
  }
  else {
    return state
  }
}


function* branchInit (character: string, state: State): StateProcess {
  if (isWhitespace(character)) {
    return state.setBranch(branchWS)
  }
  else {
    throw new error.UnexpectedChar(character)
  }
}


function* branchWS (character: string, state: State): StateProcess {
  if (isWhitespace(character)) {
    return state.shiftForward()
  }
  else {
    const nchars = state.enqueued.length
    const lchars = state.location
    yield new tokens.WhiteSpaceToken(nchars, lchars)
    return state.dropBuffer().setBranch(branchInit)
  }
}

///////////////////////////////////////////////////////////

function isWhitespace (character: string): boolean {
  return !! character.match(/(\s|\n|\t)/)
}
