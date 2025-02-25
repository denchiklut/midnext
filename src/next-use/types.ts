import { EdgeRequest, EdgeResponse } from '../edge'

export type MiddlewareResult = EdgeResponse | Response | void

export type Middleware = (
	req: EdgeRequest,
	res: EdgeResponse
) => Promise<MiddlewareResult> | MiddlewareResult
