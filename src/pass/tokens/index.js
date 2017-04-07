// @flow
import type { Stream } from '@/core/stream'
import type { StateProcess } from '@/pass/tokens/state'
import * as error from '@/pass/tokens/error'
import State from '@/pass/tokens/state'
// import Token from '@/pass/tokens/data'

/**
 * Main
 */
export default function (stream: Stream<string>): StateProcess {
  return impl(State.create(stream, branchInit))
}

///////////////////////////////////////////////////////////


function* impl (state: State): StateProcess {
  const { done, value } = state.current()
  if (! done && value != null) {
    const update = yield * state.withBranch(value)
    return yield * impl(update)
  }
  else if (done) {
    return state
  }
  else {
    throw new error.EmptyInputError()
  }
}


function* branchInit (character: string, state: State): StateProcess {
  if (isWhitespace(character)) {
    return state.enqueue(character).setBranch(branchWS)
  }
  else {
    throw new error.UnexpectedChar(character)
  }
}


function* branchWS (character: string, state: State): StateProcess {
  return state.shiftForward()
}

///////////////////////////////////////////////////////////

function isWhitespace (character: string): boolean {
  return !! character.match(/(\s|\n|\t)/)
}
