import { EdgeRequest, EdgeResponse } from '../edge'

export type MiddlewareResult = EdgeResponse | void;

export type Middleware = (
    req: EdgeRequest,
    res: EdgeResponse
) => Promise<MiddlewareResult> | MiddlewareResult;

