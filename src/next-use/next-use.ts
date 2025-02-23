import { EdgeRequest, EdgeResponse } from '../edge'
import type { Middleware } from './types';

export class NextUse {
    private readonly middlewares: Array<Middleware> = [];
    private req: EdgeRequest;
    private res: EdgeResponse;

    constructor(req: Request, res = EdgeResponse.next()) {
        this.req = new EdgeRequest(req, req)
        this.res = res
    }

    public use(middleware: Middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    public async run() {
        for (const middleware of this.middlewares) {
            const res = await middleware(this.req, this.res);

            if (!(res instanceof Response)) continue;

            const isRedirect = [301, 302, 303, 307, 308].includes(res.status);
            const isRewrite = res.headers.get('x-middleware-rewrite');
            const isNext = res.headers.has('x-middleware-next');

            if (isNext) continue;

            if (isRedirect) return res;

            if (isRewrite) {
                const rewrite = EdgeResponse.rewrite(isRewrite, {
                    request: this.req,
                    headers: [...this.res.headers, ...res.headers]
                })

                this.req = EdgeRequest.fromRewrite(rewrite, this.req.data)
                this.res = rewrite
            } else {
                return res
            }
        }

        return EdgeResponse.next({ request: this.req, headers: this.res.headers})
    }
}
