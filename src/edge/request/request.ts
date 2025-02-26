import { RequestCookies } from '@edge-runtime/cookies'

const INTERNALS = Symbol('edge internal request')

export class EdgeRequest extends Request {
	private [INTERNALS]: {
		cookies: RequestCookies
		edgeUrl: URL
		data: EdgeRequest.Data
	}

	constructor(input: URL | RequestInfo, init = {}) {
		const url = typeof input !== 'string' && 'url' in input ? input.url : String(input)

		if (input instanceof Request) {
			super(input, init)
		} else {
			super(url, init)
		}

		this[INTERNALS] = {
			cookies: new RequestCookies(this.headers),
			edgeUrl: new URL(url),
			data: {} as EdgeRequest.Data
		}
	}

	set data(data: EdgeRequest.Data) {
		this[INTERNALS].data = data ?? {}
	}

	get data() {
		return this[INTERNALS].data
	}

	get cookies() {
		return this[INTERNALS].cookies
	}

	get edgeUrl() {
		return this[INTERNALS].edgeUrl
	}
}

export namespace EdgeRequest {
	export interface Data {}
}
