import type { ExtraResponseInit } from '../types'

export function wrapHeaders(init: ExtraResponseInit | undefined, headers: Headers) {
	if (!init?.request?.headers) return

	if (!(init.request.headers instanceof Headers)) {
		throw new Error('request.headers must be an instance of Headers')
	}

	const keys = []
	for (const [key, value] of init.request.headers) {
		headers.set('x-middleware-request-' + key, value)
		keys.push(key)
	}

	headers.set('x-middleware-override-headers', keys.join(','))
}
