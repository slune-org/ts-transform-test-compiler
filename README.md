[![npm package](https://badge.fury.io/js/ts-transform-test-compiler.svg)](https://www.npmjs.com/package/ts-transform-test-compiler)
[![License](https://img.shields.io/github/license/slune-org/ts-transform-test-compiler.svg)](https://github.com/slune-org/ts-transform-test-compiler/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/slune-org/ts-transform-test-compiler.svg?branch=master)](https://travis-ci.org/slune-org/ts-transform-test-compiler)
[![Coverage Status](https://coveralls.io/repos/github/slune-org/ts-transform-test-compiler/badge.svg?branch=master)](https://coveralls.io/github/slune-org/ts-transform-test-compiler?branch=master)
[![Issues](https://img.shields.io/github/issues/slune-org/ts-transform-test-compiler.svg)](https://github.com/slune-org/ts-transform-test-compiler/issues)

# ts-transform-test-compiler - A simple API to test TypeScript transformers

This package provides a simple API to make some basic _TypeScript_ compilation using a given transformer. The purpose of this package is not to ease the use of transformers, but only to be included in a transformer test suite. For usage examples, you can look at:

- [ts-transform-asset](https://github.com/slune-org/ts-transform-asset)
- [ts-transform-auto-require](https://github.com/slune-org/ts-transform-auto-require)

# Language/langue

Because Slune is French firm, you will find all documents and messages in French. Other translations are welcome.

Anyway, because English is the language of programming, the code, including variable names and comments, are in English.

:fr: Une version française de ce document se trouve [ici](doc/fr/README.md).

# Installation

Installation is done using `npm install` command:

```bash
$ npm install --save-dev ts-transform-test-compiler
```

If you prefer using `yarn`:

```bash
$ yarn add --dev ts-transform-test-compiler
```

# Usage

First thing to do is to create a compiler object. This compiler might be shared accross the test suite as it only holds static configuration.

Then use this compiler object to set some options, if needed, and finally compile tested classes with the transformer.

```typescript
import Compiler from 'ts-transform-test-compiler'
import myTransform from '.'

describe('My test suite', function() {
  const compiler = new Compiler(myTransform, 'dist/__test__').setRootDir('__test__')

  it('should do what I expect', function() {
    const transformParams = { astring: 'hello', anumber: 12 }
    const result = compiler.setSourceFiles('test1/').compile('test1', transformParams)
    expect(result.succeeded).to.be.true
    expect(result.requireContent()).to.equal('Working!')
  })
})
```

# API

## Compiler

### constructor(transformer: Transformer, outDir: string, compilerOptions?: CompilerOptions)

Create a compiler for the given transformer.

The `outDir` parameter is the place where compiled files will be emitted. Beware that actually, each compilation is emitting files in its own directory, created under `outDir` and with the name of the current test as given in the `compile()` method.

The compiler options are optional. A sensible default set is used if none provided. The `rootDir` and `outDir` parameters are calculated at each compilation. Setting a value in the options for those parameters is then useless.

### setTransformerHook(hook: keyof CustomTransformers): this

Call this method to set the hook to use for the transformer (i.e. the phase at which the transformer is called). If this method is not called, the default hook used is `before`.

This method modifies the compiler object. You may call it once (e.g. at compiler creation time) or many times (e.g. before each test).

This method returns `this`, allowing it to be chained.

### setSourceFiles(sourceFiles: string, ignoredFiles?: string | string[]): this

Call this method to set the files to be used as sources. You may only specify entry points as the compiler will automatically require other needed files. All provided files must reside under the project root directory, which by default is the current directory.

The `sourceFiles` can either be a directory (ending with a `/` and not containing any [glob](https://www.npmjs.com/package/glob) _magic_ character) or a _glob_ pattern. If it is a directory, `**/*.ts` will be appended. In both cases, the `sourceFiles` value will be prefixed by the project root directory. Default value is `/` which takes all `.ts` files under the project root directory.

If the provided _glob_ pattern will take unwanted files, you can remove them by setting `ignoredFiles`. The value provided here will be directly given to the `ignore` option of [glob](https://www.npmjs.com/package/glob).

This method modifies the compiler object. You may call it once (e.g. at compiler creation time) or many times (e.g. before each test).

This method returns `this`, allowing it to be chained.

### setRootDir(rootDir: string | undefined): this

Set (or remove, if no parameter given) the root directory of the project. If no root directory is set, the compiler will use the current directory.

This method modifies the compiler object. You may call it once (e.g. at compiler creation time) or many times (e.g. before each test).

This method returns `this`, allowing it to be chained.

### clearGlobCaches(): this

This method clears the cache used by [glob](https://www.npmjs.com/package/glob) to search for input files. You should only call it if you have problems.

This method returns `this`, allowing it to be chained.

### compile(name: string, configuration: any): CompilationResult

Compile the files using the transformer. The `name` given to the compilation will be used to create a sub-directory under the `outDir` to emit the files. It will prevent all tests to emit files in the same place. You may, of course, give the same name to many tests, althought not recommended.

The `configuration` parameter is the configuration to give to the transformer.

The compilation returns a compilation result object.

## CompilationResult

### succeeded: boolean

Indicate if compilation succeeded, i.e. processed without error.

### print(): void

Print the diagnostic messages on standard output.

### requireContent(file?: string, variable?: string): any

Require the content of a compiled file.

If `file` is not specified, the method will directly require the output directory, so there should be an index file there.

If `variable` is provided, then the method will return the content of this exported variable, instead of the default export.

# Contributions

Even though we cannot guarantee a response time, please feel free to file an issue if you have any question or problem using the package. Pull request are also welcome.
