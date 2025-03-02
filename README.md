## Midnext

![NPM Version](https://img.shields.io/npm/v/midnext)
![NPM Downloads](https://img.shields.io/npm/dw/midnext)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/midnext)
![NPM License](https://img.shields.io/npm/l/midnext)


`Midnext` is a library that enhances the middleware development experience in Next.js, offering support with a syntax
similar to [express](http://npm.im/express) / [connect](https://www.npmjs.com/package/connect).

## Installation

```
npm i midnext
```

Or via yarn

```
yarn add midnext
```

## Use middleware

Middleware in `midnext` is executed in a stack, processing each middleware sequentially. Middleware functions can be
synchronous or asynchronous, allowing flexibility in handling requests.

```typescript
// middleware.ts
import { NextUse } from 'midnext'

export async function middleware(request: NextRequest, event: NextEvent) {
  return new NextUse({ request, event })
    .use((req, res) => {
      req.cookies.set('req-c-1', '1')
      req.headers.set('req-h-1', '1')
    })
    .use('/test', async (req, res, event) => {
      res.cookies.set('res-c-1', '2')
      res.headers.set('res-h-1', '2')
    })
    .run()
}

export const config = {}
```

## Rewrites

To rewrite a request, return `res.rewrite` from the middleware. The next middleware will receive the `updated` request with the
rewritten pathname.

```typescript
// middleware.ts
import { NextUse } from 'midnext'
import join from 'url-join'

export async function middleware(request: Request) {
  return new NextUse({ request })
    .use((req, res) => {
      const url = new URL(req.url)
      url.pathname = join('test', url.pathname)

      return res.rewrite(url)
    })
    .use((req, res) => {
      // Here, req.url's pathname starts with `test` due to the rewrite above
      console.log(req.parsedUrl.pathname)
    })
    .run()
}

export const config = {}
```

## Redirects

Returning `res.redirect` will immediately stop further middleware execution and perform a redirect.

```typescript
// middleware.ts
import { NextUse, EdgeRequest, EdgeResponse } from 'midnext'

export async function middleware(request: Request) {
  return new NextUse({ request })
    .use((req: EdgeRequest, res: EdgeResponse) => {
      return res.redirect('http://example.com')
    })
    .use((req, res) => {
      // This middleware won't be executed since the redirect was returned above
    })
    .run()
}

export const config = {}
```

## Response

You can respond from Middleware directly by returning a Response. Like a redirect, this prevents further middleware
execution.

```typescript
// middleware.ts
import { NextUse, EdgeRequest, EdgeResponse } from 'midnext'

export async function middleware(request: Request) {
  return new NextUse({ request })
    .use((req: EdgeRequest, res: EdgeResponse) => {
      return Response.json({ message: 'ok' })
    })
    .use((req, res) => {
      // This middleware won't be executed since the response was returned above
    })
    .run()
}

export const config = {}
```

## Sharing Data

To share data between multiple middleware, use the request.data property. This enables storing various types of data,
including functions, for later use in the middleware chain.

```typescript
// middleware.ts
import { NextUse } from 'midnext'

export async function middleware(request: NextRequest) {
  return new NextUse({ request })
    .use((req, res) => {
      req.data.isBot = false
      req.data.printHello = () => console.log('hello')
    })
    .use(req => {
      console.log(req.data.isBot)
      req.data.printHello()
    })
    .run()
}

export const config = {}
```

Optionally, you can type the data field on request objects for TypeScript safety:

```typescript
declare module 'midnext' {
  namespace EdgeRequest {
    interface Data {
      isBot: boolean
      printHello: () => void
    }
  }
}
```

## API

The `NextUse` class provides a middleware management system similar to Express, allowing sequential execution of
middleware functions.

- The **middleware** receives `EdgeRequest` and `EdgeResponse` as arguments allowing you to modify both request and response.
  you can stop further middleware execution by returning a Response object from the middleware (`new Response()`, `Response.json()`, `res.redirect(url)`)
- Both `EdgeRequest` and `EdgeResponse` extend the standard Web Request and Response objects, meaning they support all
  their default properties and methods.

  Below, we list only the additional properties introduced by midnext.

### NextUse Properties

| Constructor                                                                | Description                                                                                                                      |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| new NextUse({ request: Request, response?: Response, event?: FetchEvent }) | Initializes a new instance of `NextUse`, wrapping the incoming request in an `EdgeRequest` and setting an initial `EdgeResponse` |

| Method                                                             | Description                                                                                                               |
|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| use(input: string \| RegExp \| Middleware, middleware: Middleware) | Adds a middleware function to the execution stack. The middleware receives `EdgeRequest` and `EdgeResponse` as arguments. |
| run()                                                              | Executes the middleware stack in sequence, handling redirects, rewrites, and response finalization.                       |

### EdgeRequest Properties

| Property  | Description                                                                                                |
|-----------|------------------------------------------------------------------------------------------------------------|
| cookies   | Manages request cookies using [@edge-runtime/cookies](https://www.npmjs.com/package/@edge-runtime/cookies) |
| parsedUrl | Provides the parsed URL object of the request.                                                             |
| data      | Stores shared data across middleware functions. Can hold any type, including functions.                    |

### EdgeResponse Properties

| Property | Description                                                                                                 |
|----------|-------------------------------------------------------------------------------------------------------------|
| cookies  | Manages response cookies using [@edge-runtime/cookies](https://www.npmjs.com/package/@edge-runtime/cookies) |
| rewrite  | Rewrites the request URL and `continues` middleware execution with the updated request.                     |
| redirect | Redirects to a new URL and halts further middleware execution.                                              |
