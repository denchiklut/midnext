import { RequestCookies } from '@edge-runtime/cookies'

export class EdgeRequest extends Request {
	/**
	 * Provides access to request cookies.
	 * Uses `@edge-runtime/cookies` to manage Cookie headers.
	 */
	public readonly cookies: RequestCookies

	/**
	 * Parsed URL object for the request.
	 * This provides direct access to the URL properties by using the standard JavaScript `URL` API.
	 */
	public readonly parsedUrl: URL

	constructor(input: URL | RequestInfo, init = {}) {
		const url = typeof input !== 'string' && 'url' in input ? input.url : String(input)

		if (input instanceof Request) super(input, init)
		else super(url, init)

		this.parsedUrl = new URL(url)
		this.cookies = new RequestCookies(this.headers)
		this.merge(init)
	}

	private merge(init: Record<string, unknown>) {
		for (const key of Object.keys(init)) {
			if (!(key in this)) {
				this[key as keyof this] = (init as never)[key]
			}
		}
	}
}

declare global {
	namespace Midnext {
		interface EdgeRequest {}
	}
}

export interface EdgeRequest extends Midnext.EdgeRequest {}
