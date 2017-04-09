// @flow
import { withIterable } from '@/data/stream-sync'
import { iter as getIter } from '@/util/data'

test('finishes at last character', () => {
  const sInput = 'abc'
  const step1 = withIterable(sInput)
  expect(step1.done).toBeFalsy()

  const step2 = step1.shiftForward()
  expect(step2.done).toBeFalsy()

  const step3 = step2.shiftForward()
  expect(step3.done).toBeFalsy()

  const step4 = step3.shiftForward()
  expect(step4.done).toBeTruthy()
})

test('non destructive updates', () => {
  const sInput = 'abc'
  const stream = withIterable(sInput)
  const a = stream.shiftForward().shiftForward()
  const b = stream.shiftForward().shiftForward()
  expect(a).toEqual(b)
})

test('extend', () => {
  const aStream = withIterable('ab')
  const bStream = withIterable('cd')
  let cStream = aStream.extend(bStream)

  // moveforwared 3 characters to 'd'
  for (let i = 0; i < 3; i++) cStream = cStream.shiftForward()
  expect(cStream.done).toBeFalsy()

  // moveforwared 1 characters
  cStream = cStream.shiftForward()
  expect(cStream.done).toBeTruthy()
})

test('implementes iterator', () => {
  const sInput = 'abc'
  const stream = withIterable(sInput)
  const iter = getIter(stream)
  expect(iter.next().value).toEqual('a')
  expect(iter.next().value).toEqual('b')
  expect(iter.next().value).toEqual('c')
  expect(iter.next().value).toEqual(undefined)
})
