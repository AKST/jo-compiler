// @flow

/**
 * Performs a functional update, and retains the prototype.
 *
 * @param original - The return type will retain the same
 * prototype as this.
 *
 * @param update - The diff between the original and the
 * object in the return value.
 *
 * @returns A new object based on the original, with the
 * changes outlined in update, with the same prototype
 * as original.
 */
export function set<A, B> (original: A, update: B): A {
  // $FlowTodo: idfk
  const instance = { ...original, ...update }
  // $FlowTodo: idfk
  const prototype = Object.getPrototypeOf(original)
  Object.setPrototypeOf(instance, prototype)
  return (Object.freeze(instance): any)
}

/**
 * Creates a functional object that is non modifiable.
 *
 * @param Contructor - The constructor function of the type
 * being initialised.
 *
 * @param args - Arguments being based to the constructor.
 */
export function init<T> (Contructor: $FlowFixMe, ...args: Array<any>): T {
  const instance = new Contructor(...args)
  return Object.freeze(instance)
}

export function iter<T> (iterable: Iterable<T>): Iterator<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/2286
  return iterable[Symbol.iterator]()
}

export function asyncIter<T> (iterable: AsyncIterable<T>): AsyncIterator<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/2286
  return iterable[Symbol.asyncIterator]()
}

