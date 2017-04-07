import 'babel-polyfill'
import withIter from './core/stream'
import tokens from './pass/lexer'

const program = `
  (log "hello world")
`

const characters = withIter(program[Symbol.iterator]())
for (const token of tokens(characters)) {
  console.log(token.toString())
}
