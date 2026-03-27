import cac from 'cac'
import { startDev } from './dev.ts'
import { exportPdf } from './export.ts'
const cli = cac('koumoul-doc')

cli
  .command('dev [file]', 'Start dev server with live preview')
  .option('--port <port>', 'Port number', { default: 5173 })
  .action(async (file: string | undefined, options: { port: number }) => {
    if (!file) {
      console.error('Usage: koumoul-doc dev <file.md>')
      process.exit(1)
    }
    await startDev({ file, port: options.port })
  })

cli
  .command('export [file]', 'Export document to PDF')
  .option('--output <path>', 'Output PDF path')
  .action(async (file: string | undefined, options: { output?: string }) => {
    if (!file) {
      console.error('Usage: koumoul-doc export <file.md>')
      process.exit(1)
    }
    await exportPdf({ file, output: options.output })
  })

cli.help()
cli.version('0.1.0')
cli.parse()
