/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import {
  ModuleKind,
  ModuleResolutionKind,
  Node,
  ScriptTarget,
  SourceFile,
  Transformer,
  TransformerFactory,
  visitNode,
} from 'typescript'

import Compiler, { getDefaultTsConfig } from '.'

function noopTransformer(): TransformerFactory<SourceFile> {
  return (): Transformer<SourceFile> => (sf: SourceFile) => visitNode(sf, (node: Node) => node)
}

function catchOutput(cb: () => void): string[] {
  const initialErrorChanel = console.log // eslint-disable-line no-console
  const output: string[] = []
  try {
    console.log = (message: any) => output.push(message) // eslint-disable-line no-console
    cb()
    return output
  } finally {
    console.log = initialErrorChanel // eslint-disable-line no-console
  }
}

describe('Compiler', function() {
  this.slow(4000)
  this.timeout(10000)

  it('should compile with smart defaults', function() {
    const testName = 'simple'
    const compiler = new Compiler(noopTransformer, 'dist/__test__').setRootDir('__test__/success')
    const result = compiler.compile(testName, {})
    const output = catchOutput(() => result.print())
    expect(result.succeeded).to.be.true
    expect(output).to.be.empty
    expect(result.requireContent()).to.equal('Hello')
    expect(result.requireContent('options/option', 'option')).to.equal('Compiled!')
  })

  it('should compile with options', function() {
    const testName = 'options'
    const compiler = new Compiler(noopTransformer, 'dist/__test__', {
      experimentalDecorators: true,
      module: ModuleKind.CommonJS,
      moduleResolution: ModuleResolutionKind.NodeJs,
      noEmitOnError: false,
      noUnusedLocals: true,
      noUnusedParameters: true,
      stripInternal: true,
      target: ScriptTarget.ES5,
    })
      .setTransformerHook('after')
      .setSourceFiles('__test__/success/*.ts')
    const result = compiler.compile(testName, {})
    const output = catchOutput(() => result.print())
    expect(result.succeeded).to.be.true
    expect(output).to.be.empty
    expect(result.requireContent()).to.equal('Hello')
    expect(() => result.requireContent('options/option', 'option')).to.throw()
  })

  it('should take all files of a directory', function() {
    const testName = 'directory'
    const compiler = new Compiler(noopTransformer, 'dist/__test__')
      .clearGlobCaches()
      .setSourceFiles('__test__/', '**/error.ts')
    const result = compiler.compile(testName, {})
    const output = catchOutput(() => result.print())
    expect(result.succeeded).to.be.true
    expect(output).to.be.empty
    expect(result.requireContent()).to.equal('Hello')
    expect(result.requireContent('options/option', 'option')).to.equal('Compiled!')
  })

  it('should return false if errors', function() {
    const testName = 'errors'
    const compiler = new Compiler(noopTransformer, 'dist/__test__').setRootDir('__test__')
    const result = compiler.compile(testName, {})
    const output = catchOutput(() => result.print())
    expect(result.succeeded).to.be.false
    expect(output).to.be.match(/is not assignable/)
  })
})

describe('getDefaultTsConfig', () => {
  it('returns default CompilerOptions', function() {
    const compiler = new Compiler(noopTransformer, 'dist/__test__')

    expect(getDefaultTsConfig()).equal(compiler.compilerOptions)
  })

  it('Compiler can extend defaultTsConfig', function() {
    const defaultOptions = getDefaultTsConfig()
    const extendedConfig = Object.assign(getDefaultTsConfig(), { experimentalDecorators: false })
    const compiler = new Compiler(noopTransformer, 'dist/__test__', extendedConfig)

    expect(compiler.compilerOptions.noEmitOnError).equal(defaultOptions.noEmitOnError)
    expect(compiler.compilerOptions.experimentalDecorators).equal(false)
  })
})
