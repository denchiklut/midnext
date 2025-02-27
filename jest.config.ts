export default {
	preset: 'ts-jest',
	testEnvironment: '@edge-runtime/jest-environment',
	setupFilesAfterEnv: ['@edge-runtime/jest-expect'],
	moduleFileExtensions: ['ts', 'js']
}
