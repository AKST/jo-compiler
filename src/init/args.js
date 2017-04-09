// @flow
import parseCLI from 'command-line-args'
import { fromArgs, T as Config } from '@/data/config'

const cliConfig = [
  { name: 'input', type: String, multiple: true, defaultOption: true },
  { name: 'debug', type: String },
]

export default function getConfig (): Config {
  const { input: _input, debug } = parseCLI(cliConfig)
  return fromArgs({
    debug,
    input: _input || []
  })
}
