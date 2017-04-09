// @flow
import { init } from '@/util/data'

type Files = Array<string>

export type ConfigDescriptor = {
  input: Array<string>,
  debug: ?string
}

export type DebugMode = 'lexer' | 'parse'

function validDebugMode (mode: ?string): ?DebugMode {
  if (mode == null) return null
  if (mode === 'lexer') return mode
  if (mode === 'parse') return mode
  throw new TypeError('invalid debug mode specified')
}

/**
 * Configuration state
 */
export class Config {
  _files: Files
  _debugMode: ?DebugMode

  constructor (files: Files, debugMode: ?DebugMode) {
    this._files = files
    this._debugMode = debugMode
  }

  get debugMode (): ?DebugMode {
    return this._debugMode
  }

  get files (): Files {
    return [...this._files]
  }

  static create (config: ConfigDescriptor): Config {
    const mode = validDebugMode(config.debug)
    return init(Config, config.input, mode)
  }
}

/**
 * @access private
 */
export const T = Config

export default Config
