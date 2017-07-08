export function getStack (popN: number): Array<string> {
  const stack = new Error().stack.split('\n')
  return stack.slice(popN)
}
