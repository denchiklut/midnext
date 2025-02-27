import type { EdgeRequest } from '../request'
import type { EdgeResponse } from '../response'

export type MiddlewareResult = EdgeResponse | Response | void

export type Middleware<E = never> = (
	req: EdgeRequest,
	res: EdgeResponse,
	event: E
) => Promise<MiddlewareResult> | MiddlewareResult

export type Props<E> = { request: Request; response?: Response; event?: E }
export type Middlewares<E> = { regexp: RegExp; middleware: Middleware<E> }[]
