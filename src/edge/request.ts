import invariant from 'tiny-invariant'
import { RequestCookies } from '@edge-runtime/cookies'
import type { EdgeResponse } from './response'
import { unwrapHeaders } from './utils'

const INTERNALS = Symbol('edge internal request')

export class EdgeRequest extends Request {
	private [INTERNALS]: {
		cookies: RequestCookies
		edgeUrl: URL
		data: EdgeRequest.Data
	}

	constructor(input: URL | RequestInfo, init = {}) {
		const url =
			typeof input !== 'string' && 'url' in input
				? input.url
				: String(input)

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

	static fromRewrite(response: EdgeResponse, data = {}) {
		const rewrite = response.headers.get('x-middleware-rewrite')
		invariant(rewrite, 'response must a rewrite')

		const request = new EdgeRequest(rewrite, {
			headers: unwrapHeaders(response.headers)
		})
		request.data = data as EdgeRequest.Data

		return request
	}
}

export namespace EdgeRequest {
	export interface Data {}
}
