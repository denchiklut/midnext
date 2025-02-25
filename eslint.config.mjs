import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'

export default [
	{
		ignores: ['**/node_modules', '**/dist']
	},
	{
		files: ['*.ts', '*.tsx'],
		plugins: {
			'@typescript-eslint': typescriptEslint,
			prettier,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest
			},
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module'
		}
	}
]
