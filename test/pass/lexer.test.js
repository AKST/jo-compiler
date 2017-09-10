// @flow
import type { AsyncStream } from '~/data/reactive/stream-async'
import { tokenStream } from '~/pass/lexer/index'
import { Position, Location } from '~/data/location'
import * as t from '~/data/pass/lexer'

async function* asyncIter<T> (self: Iterable<T>): AsyncIterator<T> {
  for (const it of self) yield it
}

function getToken <T> (stream: AsyncStream<T>): Promise<[T, AsyncStream<T>]> {
  return Promise.all([
    stream.current(),
    stream.shiftForward(),
  ]).then(([it, next]) => {
    if (it.kind === 'just') return [it.value, next]
    throw new Error('ehh')
  })
}

function location (s, e) {
  return new Location(
    new Position(s[0], s[1]),
    new Position(e[0], e[1]),
  )
}

async function readAll <T> (stream: AsyncStream<T>): Promise<Array<T>> {
  const result = []
  for await (const item of stream) {
    result.push(item)
  }
  return result
}

type Test = Promise<any>

test('string tokens', async (): Test => {
  const input = asyncIter('"hello"')
  const stream = tokenStream(input)

  const [value] = await getToken(stream)
  expect(value).toEqual(new t.StringLexicon(
    'hello',
    new Location(
      new Position(1, 1),
      new Position(1, 8),
    ),
  ))
})

test('integer tokens', async (): Test => {
  const input = asyncIter('420\n')
  const stream = tokenStream(input)

  const [value] = await getToken(stream)
  expect(value).toEqual(new t.IntegerLexicon(
    420,
    new Location(
      new Position(1, 1),
      new Position(1, 4),
    ),
  ))
})

test('float tokens', async (): Test => {
  const input = asyncIter('69.11\n')
  const stream = tokenStream(input)

  const [value] = await getToken(stream)
  expect(value).toEqual(new t.FloatLexicon(
    69.11,
    new Location(
      new Position(1, 1),
      new Position(1, 6),
    ),
  ))
})

test('compound expression tokens', async (): Test => {
  const input = asyncIter('(plus 2 2)\n')
  const stream = tokenStream(input)

  const tokens = await readAll(stream)
  expect(tokens).toEqual([
    // (
    new t.LParenLexicon(location([1, 1], [1, 2])),

    // plus
    new t.IdentifierLexicon('plus', location([1, 2], [1, 6])),
    new t.WhiteSpaceLexicon(1, location([1, 6], [1, 7])),

    // 2
    new t.IntegerLexicon(2, location([1, 7], [1, 8])),
    new t.WhiteSpaceLexicon(1, location([1, 8], [1, 9])),

    // 2
    new t.IntegerLexicon(2, location([1, 9], [1, 10])),

    // )
    new t.RParenLexicon(location([1, 10], [1, 11])),
  ])
})
