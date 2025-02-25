import invariant from 'tiny-invariant'
import { wrapHeaders } from './headers'
import type { ExtraResponseInit, MiddlewareResponseInit } from '../types'
import { EdgeResponse } from '../response'

export function next(init?: MiddlewareResponseInit) {
	const headers = new Headers(init?.headers)
	headers.set('x-middleware-next', '1')
	wrapHeaders(init, headers)

	return new EdgeResponse(null, { ...init, headers })
}

export function rewrite(destination: string | URL, init?: ExtraResponseInit) {
	const headers = new Headers(init?.headers)
	headers.set('x-middleware-rewrite', String(destination))
	wrapHeaders(init, headers)

	return new EdgeResponse(null, { ...init, headers })
}

export function redirect(url: string | URL, init?: number | ResponseInit) {
	const status = typeof init === 'number' ? init : (init?.status ?? 307)
	invariant(
		[301, 302, 303, 307, 308].includes(status),
		'Failed to execute "redirect" on "response": Invalid status code'
	)

	const initObj = typeof init === 'object' ? init : {}
	const headers = new Headers(initObj?.headers)
	headers.set('Location', String(url))

	return new EdgeResponse(null, { ...initObj, headers, status })
}
