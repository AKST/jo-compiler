// @flow
import { version } from '@/../package.json'
import ArgumentParser from 'argus-pagus'

import { createConfig } from '@/data/config'
import type { ConfigDescriptor } from '@/data/config'

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


const debugReplParser = commandParser.addParser('debug:repl', {
  addHelp: true,
  description: 'For debugging compiler output',
})

debugReplParser.addArgument(['-p', '--pass'], {
  action: 'store',
  dest: 'pass',
  help: 'The compiler pass being debugged'
})

debugReplParser.addArgument(['-f', '--format'], {
  action: 'store',
  append: true,
  help: 'files being debugged',
  defaultValue: 'json',
})

const debugParser = commandParser.addParser('debug:build', {
  addHelp: true,
  description: 'For debugging compiler output',
})

debugParser.addArgument(['-p', '--pass'], {
  action: 'store',
  dest: 'pass',
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

export default function getConfig (): ConfigDescriptor {
  const config = parser.parseArgs()

  switch (config.mode) {
    case 'debug:repl':
      return createConfig({
        mode: 'debug:repl',
        debug: config.pass,
      })
    case 'debug:build':
      return createConfig({
        mode: 'debug:build',
        debug: config.pass,
        input: config.input,
      })
    default:
      throw new TypeError('unknown mode')
  }
}
