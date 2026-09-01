import cac from 'cac'
import { statSync, readFileSync } from 'node:fs'
import { resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startDev } from './dev.ts'
import { exportPdf } from './export.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(__dirname, '../..')

class CliError extends Error {}

function fail (message: string): never {
  throw new CliError(message)
}

function readVersion (): string {
  try {
    const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf-8'))
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

function checkDocument (file: string | undefined, command: string): string {
  if (!file) fail(`Missing document. Usage: koumoul-doc ${command} <file.md>`)
  const docFile = resolve(process.cwd(), file)
  let stat
  try {
    stat = statSync(docFile)
  } catch {
    fail(`Document not found: ${docFile}`)
  }
  if (!stat.isFile()) fail(`Not a file: ${docFile}`)
  return docFile
}

function checkPort (port: unknown): number {
  const value = typeof port === 'string' ? Number(port) : port
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 65535) {
    fail(`Invalid --port: ${String(port)} (expected an integer between 1 and 65535)`)
  }
  return value
}

function checkOutput (file: string, docFile: string, output: string | undefined): string {
  if (output === undefined) {
    if (extname(file).toLowerCase() !== '.md') {
      fail(`Cannot infer an output path from "${file}", pass --output <path.pdf>`)
    }
    return file.replace(/\.md$/i, '.pdf')
  }
  if (typeof output !== 'string' || !output.trim()) fail('Invalid --output: expected a file path')
  if (resolve(process.cwd(), output) === docFile) fail('Refusing to overwrite the source document, pick another --output')
  const dir = dirname(resolve(process.cwd(), output))
  try {
    if (!statSync(dir).isDirectory()) fail(`Output directory is not a directory: ${dir}`)
  } catch (err) {
    if (err instanceof CliError) throw err
    fail(`Output directory does not exist: ${dir}`)
  }
  return output
}

const cli = cac('koumoul-doc')

cli
  .command('dev [file]', 'Start dev server with live preview')
  .option('--port <port>', 'Port number', { default: 5173 })
  .action(async (file: string | undefined, options: { port: number }) => {
    const docFile = checkDocument(file, 'dev')
    await startDev({ file: docFile, port: checkPort(options.port) })
  })

cli
  .command('export [file]', 'Export document to PDF')
  .option('--output <path>', 'Output PDF path')
  .action(async (file: string | undefined, options: { output?: string }) => {
    const docFile = checkDocument(file, 'export')
    await exportPdf({ file: docFile, output: checkOutput(file!, docFile, options.output) })
  })

cli.help()
cli.version(readVersion())

async function main () {
  cli.parse(process.argv, { run: false })

  if (!cli.matchedCommand) {
    // --help and --version are already handled by cli.parse()
    if (cli.options.help || cli.options.version) return
    const unknown = cli.args[0]
    if (unknown) console.error(`Unknown command: ${unknown}\n`)
    else console.error('Missing command.\n')
    cli.outputHelp()
    process.exitCode = 1
    return
  }

  await cli.runMatchedCommand()
}

main().catch((err: unknown) => {
  if (err instanceof CliError) console.error(err.message)
  else if (err instanceof Error && err.name === 'CACError') console.error(err.message)
  else console.error(err instanceof Error ? (err.stack ?? err.message) : String(err))
  process.exit(1)
})
