import type { Middleware } from './types'
import { EdgeRequest, EdgeResponse } from '../edge'
import { next } from '../edge/utils'

export class NextUse {
	private readonly middlewares: Array<Middleware> = []
	private req: EdgeRequest
	private readonly res: EdgeResponse

	constructor(req: Request, res = next()) {
		this.req = new EdgeRequest(req, req)
		this.res = res
	}

	public use(middleware: Middleware) {
		this.middlewares.push(middleware)
		return this
	}

	public async run() {
		for (const middleware of this.middlewares) {
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
