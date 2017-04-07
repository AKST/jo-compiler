// @flow

export function set<A, B> (value: A, update: B): A {
  // $FlowTodo: idfk
  const instance = { ...value, ...update }
  // $FlowTodo: idfk
  const prototype = Object.getPrototypeOf(value)
  Object.setPrototypeOf(instance, prototype)
  return (Object.freeze(instance): any)
}

export function init<T> (Contructor: $FlowFixMe, ...args: Array<any>): T {
  const instance = new Contructor(...args)
  return Object.freeze(instance)
}
