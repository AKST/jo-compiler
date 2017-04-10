// @flow

import { T as AsyncStream } from '@/data/stream-async'
import { Unimplemented } from '@/data/error'
import Module from '@/data/pass/syntax'
import Token from '@/data/pass/lexer'


export async function parseModule (tokens: AsyncStream<Token>): Promise<Module> {
  throw new Unimplemented('parser')
}
