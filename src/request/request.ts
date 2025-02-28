import { RequestCookies } from '@edge-runtime/cookies'

export class EdgeRequest extends Request {
	public readonly cookies: RequestCookies
	public readonly parsedUrl: URL
	public data: EdgeRequest.Data

	constructor(input: URL | RequestInfo, init = {}) {
		const url = typeof input !== 'string' && 'url' in input ? input.url : String(input)

		if (input instanceof Request) super(input, init)
		else super(url, init)

		this.parsedUrl = new URL(url)
		this.cookies = new RequestCookies(this.headers)
		this.data = {} as EdgeRequest.Data
	}
}

export namespace EdgeRequest {
	export interface Data {}
}
