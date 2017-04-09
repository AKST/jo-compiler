// @flow

import { T as AsyncStream } from '@/data/stream-async'
import { Unimplemented } from '@/error'
import Module from '@/data/syntax-ir'
import Token from '@/data/lex-token'


export async function parseModule (tokens: AsyncStream<Token>): Promise<Module> {
  throw new Unimplemented('parser')
}
