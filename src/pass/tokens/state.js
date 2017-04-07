// @flow
import type { Stream } from '@/core/stream'
import type Token from '@/pass/tokens/data'
import { init, set } from '@/core'

type Input = Stream<string>
export type StateProcess = Generator<Token, State, State>
export type StateBranch = (char: string, state: State) => StateProcess

/**
 * Functional representation of state
 */
export default class State {
  stream: Input
  branch: StateBranch
  buffer: string

  constructor (branch: StateBranch, stream: Input) {
    this.stream = stream
    this.branch = branch
    this.buffer = ''
  }

  withBranch (character: string): StateProcess {
    return this.branch(character, this)
  }

  current (): Input {
    return this.stream
  }

  shiftForward (): State {
    const stream = this.stream.shiftForward()
    return set(this, { stream })
  }

  setBranch (branch: StateBranch): State {
    return set(this, { branch })
  }

  enqueue (character: string): State {
    return set(this, { buffer: this.buffer + character })
  }

  static create (stream: Input, branch: StateBranch): State {
    return init(State, branch, stream)
  }
}
