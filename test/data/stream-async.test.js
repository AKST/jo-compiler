// @flow
import { withIterable, withGenerator } from '~/data/stream-async'
import { asyncIter as getAsyncIter } from '~/util/data'

async function* asyncIter<T> (self: Iterable<T>): AsyncIterator<T> {
  for (const it of self) yield it
}

async function* asyncGen<T, R> (self: Iterable<T>, ret: R): AsyncGenerator<T, R, void> {
  for (const it of self) yield it
  return ret
}

type Test = Promise<any>


test('finishes at last character', async (): Test => {
  const sInput = asyncIter('abc')
  const step1 = withIterable(sInput)

  expect(await step1.done).toBeFalsy()

  const step2 = await step1.shiftForward()
  expect(await step2.done).toBeFalsy()

  const step3 = await step2.shiftForward()
  expect(await step3.done).toBeFalsy()

  const step4 = await step3.shiftForward()
  expect(await step4.done).toBeTruthy()
})

test('non destructive updates', async (): Test => {
  const sInput = asyncIter('abc')
  const stream = withIterable(sInput)
  const a = await (await stream.shiftForward()).shiftForward()
  const b = await (await stream.shiftForward()).shiftForward()
  expect(a).toEqual(b)
})

test('extend', async (): Test => {
  const aStream = withIterable(asyncIter('ab'))
  const bStream = withIterable(asyncIter('cd'))
  let cStream = aStream.extend(bStream)

  // moveforwared 3 characters to 'd'
  for (let i = 0; i < 3; i++) cStream = await cStream.shiftForward()
  expect(await cStream.done).toBeFalsy()

  // moveforwared 1 characters
  cStream = await cStream.shiftForward()
  expect(await cStream.done).toBeTruthy()
})

test('async iterator', async (): Test => {
  const sInput = asyncIter('abc')
  const stream = withIterable(sInput)
  const iter = getAsyncIter(stream)
  expect((await iter.next()).value).toEqual('a')
  expect((await iter.next()).value).toEqual('b')
  expect((await iter.next()).value).toEqual('c')
  expect((await iter.next()).value).toEqual(undefined)
})

test('omits the last generator value', async (): Test => {
  const sInput = asyncGen('abc', 5)
  const stream = withGenerator(sInput)
  const iter = getAsyncIter(stream)
  expect((await iter.next()).value).toEqual('a')
  expect((await iter.next()).value).toEqual('b')
  expect((await iter.next()).value).toEqual('c')
  expect((await iter.next()).value).toEqual(undefined)
})
