// @flow
import type {
  ConfigDebugBuild,
  ConfigDebugRepl,
  DebugMode,
} from '@/data/config'
import type Token from '@/data/pass/lexer'
import type Syntax from '@/data/pass/syntax'

import { withIterable as initSyncStream } from '@/data/stream-sync'

import { Unimplemented } from '@/data/error'
import { tokenStream, initialState as lexerInit, withState as lexerLoop } from '@/pass/lexer'
import type { State as LexerState, Data as Lexicon } from '@/pass/lexer'

import { syntaxStream } from '@/pass/parse'
import { readStream } from '@/util/io'

type TotalPass = (fileName: string) => Promise<Result<any>>
type Result<T> = { filename: string, data: T }
type InputObservable = AsyncIterator<string>
type OutputConsumer = AsyncGenerator<void, void, string>

type PassReducer<R, S> = (state: S, input: string) => AsyncGenerator<R, S, any>
type IncrementalPass = { makeState (): any, withInput: PassReducer<any, any> }

export type ReplInterface = {
  startInput: string,
  continueInput: string,
  startOutput: string,
  continueOutput: string,
}

export async function withFiles (config: ConfigDebugBuild): Promise<Object> {
  const pass = getTotalPass(config.debug)
  const result = { pass: config.debug, files: [] }
  for (const filename of config.input) {
    result.files.push(await pass(filename))
  }
  return result
}

export async function withRepl (
    config: ConfigDebugRepl,
    input: InputObservable,
    output: OutputConsumer,
    initialInterface: ?ReplInterface = null,
  ): Promise<void> {

  const cliInterface = initialInterface || defaultReplInterface()
  const passer = getIncrementalPass(config.debug)

  // starting the iterator apparently
  await output.next('')

  main: while (true) {
    const state = passer.makeState()
    const intepreter = passer.withInput(state)
    await output.next(cliInterface.startInput)

    const { done: inputKilled, value: inputValue } = await input.next()
    if (inputKilled) break

    let inputText: string = inputValue
    cont: while (true) {
      const { done: intepreterDone, value: result } = await intepreter.next(inputText)
      if (intepreterDone) {
        if (result == null) break main
        const serialised = formatOutput(cliInterface, JSON.stringify(result));
        console.log(result);
        await output.next(`${serialised}\n`)
        break cont
      }

      // if continuing show he continue output
      await output.next(cliInterface.continueInput)

      const tailResult = await input.next()
      if (tailResult.done) break
      inputText = tailResult.value
    }
  }
}

/////////////////////////////////////////////////////////

/**
 * This function returns a pass function that passes over
 * a complete set of input.
 *
 * @access private
 * @param mode - The debug mode.
 */
function getTotalPass (mode: DebugMode): TotalPass {
  /*
   * Lexicon pass
   */
  async function lexerPass (filename: string): Promise<Result<Array<Token>>> {
    const result = { filename, data: [] }
    for await (const token of tokenStream(readStream(filename))) {
      result.data.push(token)
    }
    return result
  }

  /*
   * Syntax pass
   */
  async function parsePass (filename: string): Promise<Result<Array<Syntax>>> {
    const result = { filename, data: [] }
    const tokens = tokenStream(readStream(filename))
    for await (const syntax of syntaxStream(tokens)) {
      result.data.push(syntax)
    }
    return result
  }

  /*
   * main logic
   */
  switch (mode) {
    case 'lexer': return lexerPass
    case 'parse': return parsePass
    default: throw new Unimplemented('impossible-error')
  }
}

/**
 * This function returns a partial pass function.
 *
 * @access private
 * @param mode - The debug mode.
 */
function getIncrementalPass (mode: DebugMode): IncrementalPass {
  const lexerLoopImpl = async function* (state: LexerState, input: string): AsyncGenerator<Lexicon, LexerState, void> {
    const lexer = lexerLoop(state, initSyncStream(input))

    while (true) {
      const { done, value } = await lexer.next()

      if (! done) {
        yield value
      }
      else {
        if (value == null) throw new Unimplemented('unexpected state value')
        return value
      }
    }
  }

  const lexerPasser: IncrementalPass = {
    makeState: lexerInit,
    withInput: lexerLoopImpl,
  }

  switch (mode) {
    case 'lexer': return lexerPasser
    default:
      throw new Unimplemented(`partial '${mode}' is not implemented`)
  }
}

/////////////////////////////////////////////////////////

function formatOutput (cliInterface: ReplInterface, output: string): string {
  const split = output.split('\n').join(`\n${cliInterface.continueInput}`)
  return `${cliInterface.startOutput}${split}`
}

export function defaultReplInterface (): ReplInterface {
  return {
    startInput: '-> ',
    continueInput: ' |',
    startOutput: '-= ',
    continueOutput: ' | ',
  }
}

