// @flow
import { version } from '@/../package.json'
import { ArgumentParser } from 'argus-pagus'
import HelpAction from 'argus-pagus/lib/action/help'
import VersAction from 'argus-pagus/lib/action/version'
import StoreAction from 'argus-pagus/lib/action/store'
import Config from '@/data/config'

// due to some bull shit with arg pass exiting
// immediately, lets override that and just store it...
HelpAction.prototype.call = StoreAction.prototype.call
VersAction.prototype.call = StoreAction.prototype.call

const parser = new ArgumentParser({
  version,
  addHelp: true,
  description: 'JoScipt JoLang: a bizarre language',
})

const commandParser = parser.addSubparsers({ title: 'command', dest: 'mode' })

const buildParser = commandParser.addParser('build', {
  addHelp: true,
  description: 'build source code',
})

buildParser.addArgument('main', {
  action: 'store',
  nargs: '1',
  append: true,
  help: 'files being debugged'
})

const debugParser = commandParser.addParser('debug', {
  addHelp: true,
  description: 'For debugging compiler output',
})

debugParser.addArgument(['-p', '--pass'], {
  action: 'store',
  dest: 'mode',
  help: 'The compiler pass being debugged'
})

debugParser.addArgument('input', {
  action: 'store',
  nargs: '*',
  append: true,
  help: 'files being debugged'
})

debugParser.addArgument(['-f', '--format'], {
  action: 'store',
  append: true,
  help: 'files being debugged',
  defaultValue: 'json',
})

export default function getConfig (): Config {
  const config = parser.parseArgs()
  const descriptor = { debug: config.mode, input: config.input }
  return Config.create(descriptor)
}
