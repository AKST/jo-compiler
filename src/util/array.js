// @flow
type Predicate<T> = (it: T) => boolean

type IterTransform<T> = Iterable<T> => Iterable<T>

export function takeWhile <T> (p: Predicate<T>): IterTransform<T> {
  return function* (iter) {
    for (const item of iter) {
      if (! p(item)) return
      yield item
    }
  }
}

export function join (inbetween: string) {
  return function (iter: Iterable<string>): string {
    let first = true
    let result = ''
    for (const item: string of iter) {
      if (first) first = false
      else result += inbetween
      result += item
    }
    return result
  }
}
