import { producerFromStream } from '~/data/reactive/producer'
import { Readable } from 'stream'

class EmitValues extends Readable {
  constructor (...args) {
    super()
    this._willEmit = args.concat([null])
    this._position = 0
  }

  _read () {
    setImmediate(() => {
      this.push(this._willEmit[this._position])
      this._position += 1
    })
  }
}

function getValue (producer) {
  return producer.pull().then(it => it.value)
}

function isDone (producer) {
  return producer.pull().then(it => it.done)
}

test('get values', async () => {
  expect.assertions(4)

  const stream = new EmitValues('1', '2', '3')
  const producer = producerFromStream(stream)

  expect(await getValue(producer)).toEqual('1')
  expect(await getValue(producer)).toEqual('2')
  expect(await getValue(producer)).toEqual('3')
  expect(await isDone(producer)).toBeTruthy()
})
