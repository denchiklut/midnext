import type { Config } from 'jest'

export default {
	preset: 'ts-jest',
	setupFilesAfterEnv: ['@edge-runtime/jest-expect']
} satisfies Config
