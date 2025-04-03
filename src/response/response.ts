import { ResponseCookies } from '@edge-runtime/cookies'
import { rewrite, type ExtraResponseInit } from '@vercel/edge'

export class EdgeResponse extends Response {
	public readonly cookies: ResponseCookies

	constructor(body?: BodyInit | null, init?: ResponseInit) {
		super(body, init)

		/**
		 * Provides access to response cookies.
		 * Uses `@edge-runtime/cookies` to manage Set-Cookie headers.
		 */
		this.cookies = new ResponseCookies(this.headers)
	}

	/**
	 * Creates a rewrite response to the specified destination.
	 * Unlike `sendRewrite`, this does not signal middleware to stop further execution.
	 */
	public rewrite(destination: string | URL) {
		return rewrite(destination)
	}

	/**
	 * Creates a rewrite response that signals middleware to stop further execution.
	 */
	public sendRewrite(destination: string | URL, init?: ExtraResponseInit) {
		const headers = new Headers(init?.headers)
		headers.set('x-midnext-send', '1')
		headers.delete('x-middleware-next')

		return rewrite(destination, { ...init, headers })
	}

	public redirect(url: string | URL, init?: number | ResponseInit) {
		const status = typeof init === 'number' ? init : (init?.status ?? 307)
		if (![301, 302, 303, 307, 308].includes(status)) {
			throw new Error('Failed to execute "redirect" on "response": Invalid status code')
		}

		const initObj = typeof init === 'object' ? init : {}
		const headers = new Headers(initObj.headers)
		headers.set('Location', String(url))
		headers.delete('x-middleware-next')

		return new Response(null, { ...initObj, headers, status })
	}

	static from(response: Response) {
		return new EdgeResponse(response.body, response)
	}
}

declare global {
	namespace Midnext {
		interface EdgeResponse {}
	}
}

export interface EdgeResponse extends Midnext.EdgeResponse {}
