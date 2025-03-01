import { next } from '@vercel/edge'
import { pathToRegexp } from 'path-to-regexp'
import type { Middleware, Middlewares, Props } from './types'
import { EdgeResponse } from '../response'
import { EdgeRequest } from '../request'

export class NextUse<T, E = T extends FetchEvent ? T : never> {
	private req: EdgeRequest
	private readonly res: EdgeResponse
	private readonly middlewares: Middlewares<E> = []
	private readonly event: E

	constructor({ request, response = next(), event }: Props<E>) {
		this.req = new EdgeRequest(request, request)
		this.res = EdgeResponse.from(response)
		this.event = event as E
	}

	public use(input: string | RegExp | Middleware<E>, ...middlewares: Middleware<E>[]) {
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

			if (isNext) continue

			if (rewrite) {
				const req = new EdgeRequest(rewrite, this.req)
				req.data = this.req.data

				this.req = req
				this.res.headers.set('x-middleware-rewrite', rewrite)
			} else {
				res.headers.delete('x-middleware-next')
				return res
			}
		}

		return next({ request: this.req, headers: this.res.headers })
	}
}
