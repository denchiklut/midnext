import { pathToRegexp } from 'path-to-regexp'
import type { Middleware } from './types'
import { EdgeRequest, EdgeResponse } from '../edge'
import { next } from '../edge/utils'

export class NextUse {
	private req: EdgeRequest
	private readonly res: EdgeResponse
	private readonly middlewares: { regexp?: RegExp; middleware: Middleware }[] = []

	constructor(req: Request, res = next()) {
		this.req = new EdgeRequest(req, req)
		this.res = res
	}

	public use(pathOrMiddleware: string | Middleware, ...middlewares: Middleware[]) {
		const regexp = typeof pathOrMiddleware === 'function' ? /.*/ : pathToRegexp(pathOrMiddleware).regexp
		const middlewareList = typeof pathOrMiddleware === 'function' ? [pathOrMiddleware, ...middlewares] : middlewares
		this.middlewares.push(...middlewareList.map(middleware => ({ regexp, middleware })))

		return this
	}

	public async run() {
		for (const { regexp, middleware } of this.middlewares) {
			if (!regexp?.test(this.req.parsedUrl.pathname)) continue

			const res = await middleware(this.req, this.res)

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
