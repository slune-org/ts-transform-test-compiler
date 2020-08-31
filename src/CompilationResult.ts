import { join } from 'path'
import { Diagnostic, DiagnosticCategory, flattenDiagnosticMessageText } from 'typescript'

/**
 * The compilation result.
 */
export default class CompilationResult {
  /**
   * Create the compilation result.
   *
   * @param outDir - The final output directory.
   * @param diagnostics - Diagnostic list.
   */
  public constructor(private readonly outDir: string, private readonly diagnostics: Diagnostic[]) {}

  /**
   * Indicate if compilation has errors.
   *
   * @returns True if compilation succeeded without error.
   */
  public get succeeded(): boolean {
    return this.diagnostics.every(diagnostic => diagnostic.category !== DiagnosticCategory.Error)
  }

  /**
   * Print the diagnostics.
   */
  public print(): void {
    this.diagnostics.forEach(diagnostic => {
      const { line, character } = diagnostic.file
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
        : /* istanbul ignore next */ { line: 0, character: 0 }
      const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      const fileName = diagnostic.file ? diagnostic.file.fileName : /* istanbul ignore next */ '(unknown)'
      // eslint-disable-next-line no-console
      console.log(`${fileName} (${line + 1}, ${character + 1}): ${message}`)
    })
  }

  /**
   * Require the content of a compiled file.
   *
   * @param file - The file in which to require content.
   * @param variable - The variable to load from the file content.
   * @returns The content of the file.
   */
  public requireContent(file?: string, variable?: string): any {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(join(this.outDir, file ?? ''))[variable ?? 'default']
  }
}
