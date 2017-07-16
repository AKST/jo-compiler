import { Unimplemented } from '@/data/error'

export function notImplemented (reasonMaybe: ?string) {
  return (target, key, descriptor) => {
    const reason = reasonMaybe || 'for no specific reason'

    const get = function () {
      const type = this.constructor.name
      const message = `'${key}' not implemented ${type}, ${reason}`
      throw new Unimplemented(message)
    }

    return { ...descriptor, get }
  }
}

export function formatError (error: Error): string {
  return error.stack
}
