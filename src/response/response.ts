import invariant from 'tiny-invariant'
import { ResponseCookies } from '@edge-runtime/cookies'
import { rewrite } from '@vercel/edge'

const INTERNALS = Symbol('midnext response')

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

	public rewrite(destination: string | URL) {
		return rewrite(destination)
	}

	public redirect(url: string | URL, init?: number | ResponseInit) {
		const status = typeof init === 'number' ? init : (init?.status ?? 307)
		invariant(
			[301, 302, 303, 307, 308].includes(status),
			'Failed to execute "redirect" on "response": Invalid status code'
		)

		const initObj = typeof init === 'object' ? init : {}
		const headers = new Headers(initObj?.headers)
		headers.set('Location', String(url))

		return new Response(null, { ...initObj, headers, status })
	}

	static from(response: Response) {
		return new EdgeResponse(response.body, response)
	}
}
