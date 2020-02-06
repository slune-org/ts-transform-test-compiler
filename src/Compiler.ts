import { hasMagic, sync as readFiles } from 'glob'
import { join } from 'path'
import {
  CompilerOptions,
  CustomTransformers,
  ModuleKind,
  ModuleResolutionKind,
  Program,
  ScriptTarget,
  SourceFile,
  TransformerFactory,
  createCompilerHost,
  createProgram,
  getPreEmitDiagnostics,
} from 'typescript'

import CompilationResult from './CompilationResult'

type TransformerMetaFactory = (program: Program, configuration: any) => TransformerFactory<SourceFile>

const defaultTsConfig: CompilerOptions = {
  experimentalDecorators: true,
  module: ModuleKind.CommonJS,
  moduleResolution: ModuleResolutionKind.NodeJs,
  noEmitOnError: false,
  noUnusedLocals: true,
  noUnusedParameters: true,
  stripInternal: true,
  target: ScriptTarget.ES2015,
}

/**
 * Typescript compiler for transformer testing.
 */
export default class Compiler {
  /**
   * The transformer hook (the phase when transformer is to be called).
   */
  private transformerHook: keyof CustomTransformers = 'before'

  /**
   * A glob or directory containing all source files to compile.
   */
  private sourceFiles = '/'

  /**
   * Source files included in sourceFiles but which will be ignored for compilation.
   */
  private ignoredFiles?: string | string[]

  /**
   * The root of the project.
   */
  private rootDir: string | undefined

  /**
   * The cache used by the glob source file search.
   */
  private globCache = { cache: {}, statCache: {}, symlinks: {} }

  /**
   * Create the compiler.
   *
   * @param transformer - The transformer function to test.
   * @param outDir - The directory where compilation result will be emitted.
   * @param compilerOptions - The compiler options, if default options do not fit. As they may change for
   * each test, `rootDir` and `outDir` should not be set here (will be overriden at each compilation).
   */
  public constructor(
    private readonly transformer: TransformerMetaFactory,
    private readonly outDir: string,
    private readonly compilerOptions: CompilerOptions = defaultTsConfig
  ) {}

  /**
   * Set the transformer hook (the phase when transformer is to be called).
   *
   * @param hook - The transformer hook.
   * @returns `this` for chaining.
   */
  public setTransformerHook(hook: keyof CustomTransformers): this {
    this.transformerHook = hook
    return this
  }

  /**
   * Set the files to compile.
   *
   * @param sourceFiles - Either a directory or a glob used to select files to compile.
   * @param ignoredFiles - Files to be ignored from previous list.
   * @returns `this` for chaining.
   */
  public setSourceFiles(sourceFiles: string, ignoredFiles?: string | string[]): this {
    this.sourceFiles = sourceFiles
    this.ignoredFiles = ignoredFiles
    return this
  }

  /**
   * Set the root directory for the project compilation. This parameter is directly injected in the
   * `rootDir` parameter of the compiler options.
   *
   * @param rootDir - The root directory to use.
   * @returns `this` for chaining.
   */
  public setRootDir(rootDir: string | undefined): this {
    this.rootDir = rootDir
    return this
  }

  /**
   * Clear the glob cache for if there is a change in file structure.
   *
   * @returns `this` for chaining.
   */
  public clearGlobCaches(): this {
    this.globCache = { cache: {}, statCache: {}, symlinks: {} }
    return this
  }

  /**
   * Compile the source files with a given transformer configuration.
   *
   * @param name - The name of the compilation. Will be used as a sub-folder for `outDir`.
   * @param configuration - The configuration to give to transformer.
   * @returns The compilation result.
   */
  public compile(name: string, configuration: any): CompilationResult {
    // Prepare options and compiler host
    const options: CompilerOptions = {
      ...this.compilerOptions,
      rootDir: this.rootDir,
      outDir: join(this.outDir, name),
    }
    const compilerHost = createCompilerHost(options)

    // Search for files to compile
    let directory = compilerHost.getCurrentDirectory()
    this.rootDir && (directory = join(directory, this.rootDir))
    let sourceFiles = join(directory, this.sourceFiles)
    sourceFiles.slice(-1) === '/' && !hasMagic(sourceFiles) && (sourceFiles = sourceFiles + '**/*.ts')
    const input = readFiles(sourceFiles, { ignore: this.ignoredFiles, cwd: directory, ...this.globCache })

    // Let TypeScript compile
    const program = createProgram(input, options, compilerHost)
    const emitResult = program.emit(undefined, undefined, undefined, undefined, {
      [this.transformerHook]: [this.transformer(program, configuration)],
    })
    return new CompilationResult(
      join(compilerHost.getCurrentDirectory(), this.outDir, name),
      getPreEmitDiagnostics(program).concat(emitResult.diagnostics)
    )
  }
}
