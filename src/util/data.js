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
 *
 * @returns An immutable instance of the constructor.
 */
export function init<T> (Contructor: $FlowFixMe, ...args: Array<any>): T {
  const instance = new Contructor(...args)
  return Object.freeze(instance)
}

/**
 * Due to dodginess with flow's typechecker I can't actually
 * get an iterator instance using the computed property.
 *
 * @param iterable - An item with an iterator.
 *
 * @returns The iterator of the iterable.
 */
export function iter<T> (iterable: Iterable<T>): Iterator<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/2286
  return iterable[Symbol.iterator]()
}

/**
 * Due to dodginess with flow's typechecker I can't actually
 * get an asyncIterator instance using the computed property.
 *
 * @param asyncIterable - An item with an iterator key.
 *
 * @returns The async iterator of the asyncIterable.
 */
export function asyncIter<T> (asyncIterable: AsyncIterable<T>): AsyncIterator<T> {
  // $FlowTodo: https://github.com/facebook/flow/issues/2286
  return asyncIterable[Symbol.asyncIterator]()
}

