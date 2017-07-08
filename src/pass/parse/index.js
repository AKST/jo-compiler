// @flow

import { T as AsyncStream, withIterable } from '@/data/stream-async'
import { Unimplemented } from '@/data/error'
import * as parseError from '@/data/error/parse'
import Syntax, * as syn from '@/data/pass/syntax'
import Lexicon, * as lex from '@/data/pass/lexer'

type Input = AsyncStream<Lexicon>

export function syntaxStream (tokens: Input): AsyncStream<syn.Syntax> {
  return withIterable(streamSyntax(tokens))
}

async function* streamSyntax (tokens: Input): AsyncIterator<syn.Syntax> {
  const read = await nextExpression(tokens)
  if (read.kind === 'done') return
  if (read.kind === 'some') {
    yield read.value
    return yield * streamSyntax(read.rest)
  }
  if (read.kind === 'unacceptable') {
    throw new parseError.UnexpectedLexicon(read.encounted)
  }
}


type ReadUpdate =
  | { kind: 'more', rest: Input, value: Syntax }
  | { kind: 'done' }
  | { kind: 'unacceptable', encounted: Array<Lexicon> }

type Reader = (tokens: Input) => Promise<ReadUpdate>

const nextExpression: Reader = choiceOf(
  nextCompoundExpression,
)


async function nextCompoundExpression (tokens: Input): Promise<ReadUpdate> {
  const result = await tokens.current()
  if (result.kind === 'just') {
    const current = result.value
    if (! (current instanceof lex.LParenLexicon)) return unacceptable(current)
    throw new Unimplemented('nextCompoundExpression')
  }
  else {
    return { kind: 'done' }
  }
}


function choiceOf (...choices: Array<Reader>): Reader {
  return async function (tokens: Input) {
    const notAccepted = []
    for (const choice of choices) {
      const result = await choice(tokens)
      if (result.kind === 'done') return result

      if (result.kind === 'unacceptable') {
        const rUnaccepted = result.encounted
        while (rUnaccepted.length) notAccepted.push(rUnaccepted.pop())
        continue
      }

      if (result.kind === 'more') {
        return result
      }
    }
    return { kind: 'unacceptable', encounted: notAccepted }
  }
}


function unacceptable (token: Lexicon): ReadUpdate {
  return { kind: 'unacceptable', encounted: [token] }
}

