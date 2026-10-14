import { globalIgnores } from 'eslint/config'
import neostandard from 'neostandard'

export default [globalIgnores(['dist']), ...neostandard({ ts: true })]
