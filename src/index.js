import 'babel-polyfill'
import withIter from './core/stream'
import tokens from './pass/tokens'

const program = `
  (log "hello world")
`

const characters = withIter(program[Symbol.iterator]())
for (const token of tokens(characters)) {
  console.log(token)
}
