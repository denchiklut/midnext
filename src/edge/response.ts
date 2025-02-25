import invariant from 'tiny-invariant'
import { ResponseCookies } from '@edge-runtime/cookies'
import type { ExtraResponseInit, MiddlewareResponseInit } from './types'
import { wrapHeaders } from './utils'

const INTERNALS = Symbol('edge internal response')

export class EdgeResponse<Body = unknown> extends Response {
	private [INTERNALS]: {
		cookies: ResponseCookies
		body?: Body
	}

	constructor(body?: BodyInit | null, init?: ResponseInit) {
		super(body, init)

		this[INTERNALS] = {
			cookies: new ResponseCookies(this.headers)
		}
	}

	get cookies() {
		return this[INTERNALS].cookies
	}

	static json<Body>(body: Body, init?: ResponseInit) {
		const response = Response.json(body, init)
		return new EdgeResponse(response.body, response)
	}

	static rewrite(destination: string | URL, init?: ExtraResponseInit) {
		const headers = new Headers(init?.headers)
		headers.set('x-middleware-rewrite', String(destination))
		wrapHeaders(init, headers)

		return new EdgeResponse(null, { ...init, headers })
	}

	static next(init?: MiddlewareResponseInit) {
		const headers = new Headers(init?.headers)
		headers.set('x-middleware-next', '1')
		wrapHeaders(init, headers)

		return new EdgeResponse(null, { ...init, headers })
	}

	static redirect(url: string | URL, init?: number | ResponseInit) {
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
}
