// @flow
import { init } from '@/core'

type Files = Array<string>

export type ConfigDescriptor = {
  input: Array<string>,
  debug: ?string
}

export type DebugMode = 'lexer' | 'parse'

export function fromArgs (config: ConfigDescriptor): Config {
  return init(Config, config.input, config.debug)
}

class Config {
  _files: Files
  _debugMode: ?DebugMode

  constructor (files: Files, debugMode: ?DebugMode) {
    this._files = files
    this._debugMode = debugMode
  }

  get files (): Files {
    return [...this._files]
  }
}

export const T = Config

export default Config
