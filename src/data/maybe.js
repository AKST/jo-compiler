// @flow

type Just<T> = { kind: 'just', value: T }
type None = { kind: 'none' }

export type Maybe<T> = Just<T> | None

export function just<T> (value: T): Maybe<T> {
  return { kind: 'just', value }
}

export function none<T> (): Maybe<T> {
  return { kind: 'none' }
}

export function maybe<T> (value: ?T): Maybe<T> {
  return value == null ? none() : just(value)
}
