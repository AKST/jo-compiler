// @flow
import parseCLI from 'command-line-args'
import Config from '@/data/config'

const cliConfig = [
  { name: 'input', type: String, multiple: true, defaultOption: true },
  { name: 'debug', type: String },
]

export default function getConfig (): Config {
  const { input: _input, debug } = parseCLI(cliConfig)
  const input = _input || []
  return Config.create({ debug, input })
}
