// @flow

export default class Comparison {
  _score: number

  constructor (score: number) {
    this._score = score
  }

  isGreater () {
    return this._score > 0
  }
}
