import { next } from '@vercel/edge'
import { pathToRegexp } from 'path-to-regexp'
import type { Middleware, Middlewares, Props } from './types'
import { EdgeResponse } from '../response'
import { EdgeRequest } from '../request'

export class NextUse<T, E = T extends FetchEvent ? T : never> {
	private req: EdgeRequest
	private readonly res: EdgeResponse
	private readonly event: E
	private readonly middlewares: Middlewares<E> = []

	constructor({ request, response = next(), event }: Props<E>) {
		this.req = new EdgeRequest(request, request)
		this.res = EdgeResponse.from(response)
		this.event = event as E
	}

	public use(input: string | Middleware<E>, ...middlewares: Middleware<E>[]) {
		const regexp = typeof input === 'function' ? /.*/ : pathToRegexp(input).regexp
		const middlewareList = typeof input === 'function' ? [input, ...middlewares] : middlewares
		this.middlewares.push(...middlewareList.map(middleware => ({ regexp, middleware })))

		return this
	}

	public async run() {
		for (const { regexp, middleware } of this.middlewares) {
			if (!regexp.test(this.req.parsedUrl.pathname)) continue

			const res = await middleware(this.req, this.res, this.event)

			if (!(res instanceof Response)) continue

			const isRedirect = [301, 302, 303, 307, 308].includes(res.status)
			const rewrite = res.headers.get('x-middleware-rewrite')
			const isNext = res.headers.has('x-middleware-next')

			if (isNext) continue

			if (isRedirect) return res

			if (rewrite) {
				const req = new EdgeRequest(rewrite, this.req)
				req.data = this.req.data

				this.req = req
				this.res.headers.set('x-middleware-rewrite', rewrite)
			} else {
				return res
			}
		}

		return next({ request: this.req, headers: this.res.headers })
	}
}
