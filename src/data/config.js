// @flow
export type ConfigDebugBuild
  = { mode: 'debug:build', input: Array<string>, debug: DebugMode }

export type ConfigDebugRepl
  = { mode: 'debug:repl', debug: DebugMode }

export type ConfigDescriptor
  = ConfigDebugBuild
  | ConfigDebugRepl

export type DebugMode = 'lexer' | 'parse'

function validDebugMode (mode: ?string): ?DebugMode {
  if (mode == null) return null
  if (mode === 'lexer') return mode
  if (mode === 'parse') return mode
  throw new TypeError('invalid debug mode specified')
}

/**
 * Sanitizes the configuration options.
 *
 * @param config - The config object being sanitized.
 */
export function createConfig (config: ConfigDescriptor): ConfigDescriptor {
  if (['debug:build', 'debug:repl'].includes(config.mode)) {
    if (config.debug == null) throw new TypeError('unspecified mode')
    validDebugMode(config.debug)
  }
  return Object.freeze(config)
}

/**
 * @access private
 */
export type T = ConfigDescriptor
