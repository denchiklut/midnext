import { ResponseCookies } from '@edge-runtime/cookies'
import { redirect, rewrite } from '../utils/functions'

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

	public rewrite(destination: string | URL) {
		return rewrite(destination)
	}

	public redirect(url: string | URL, init?: number | ResponseInit) {
		return redirect(url, init)
	}
}
