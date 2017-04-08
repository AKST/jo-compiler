import 'babel-polyfill'
import { withIterable } from './core/stream'
import tokens from './pass/lexer'

const program = `
  (log "hello world")
`

const characters = withIterable(program)
for (const token of tokens(characters)) {
  console.log(token.toString())
}
