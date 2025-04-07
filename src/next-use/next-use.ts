import { next } from '@vercel/edge'
import { pathToRegexp } from 'path-to-regexp'
import type { Middleware, Middlewares, Props } from './types'
import { EdgeResponse } from '../response'
import { EdgeRequest } from '../request'

export class NextUse {
	private req: EdgeRequest
	private readonly res: EdgeResponse
	private readonly middlewares: Middlewares = []
	private readonly event: FetchEvent

	constructor({ request, response = next(), event }: Props) {
		this.req = new EdgeRequest(request, request)
		this.res = EdgeResponse.from(response)
		this.event = event
	}

	public use(input: string | RegExp | Middleware, ...middlewares: Middleware[]) {
		const isMiddleware = typeof input === 'function'
		const regexp = isMiddleware ? /.*/ : input instanceof RegExp ? input : pathToRegexp(input).regexp
		const middlewareList = isMiddleware ? [input, ...middlewares] : middlewares

		this.middlewares.push(...middlewareList.map(middleware => ({ regexp, middleware })))

		return this
	}

	public async run() {
		for (const { regexp, middleware } of this.middlewares) {
			if (!regexp.test(this.req.parsedUrl.pathname)) continue

			const res = await middleware(this.req, this.res, this.event)

			if (!(res instanceof Response)) continue

			const rewrite = res.headers.get('x-middleware-rewrite')
			const isNext = res.headers.has('x-middleware-next')
			const isSend = res.headers.has('x-midnext-send')

			if (isNext) continue

			if (rewrite && !isSend) {
				this.req = new EdgeRequest(rewrite, this.req)
				this.res.headers.set('x-middleware-rewrite', rewrite)
			} else {
				res.headers.delete('x-midnext-send')
				return res
			}
		}

		const res = next({ request: this.req, headers: this.res.headers })
		if (res.headers.has('x-middleware-rewrite')) res.headers.delete('x-middleware-next')

		return res
	}
}
