import type { EdgeRequest } from '../request'
import type { EdgeResponse } from '../response'

export type Middleware = (request: EdgeRequest, response: EdgeResponse, event: FetchEvent) => Promise<unknown> | unknown

export type Props = { request: Request; response?: Response; event: FetchEvent }

export type Middlewares = { regexp: RegExp; middleware: Middleware }[]
