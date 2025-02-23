## Midnext

[![npm version](https://img.shields.io/npm/v/midnext.svg?style=for-the-badge)](https://www.npmjs.com/package/midnext)

`midnext` is a library that enhances the middleware development experience in Next.js, offering support with a syntax similar to [express](http://npm.im/express) / [connect](https://www.npmjs.com/package/connect).

## Installation
 ```
 npm i midnext
 ```
Or via yarn
```
yarn add midnext
```

## Use middleware
Middleware in `midnext` is executed in a stack, processing each middleware sequentially. Middleware functions can be synchronous or asynchronous, allowing flexibility in handling requests.

```typescript
// middleware.ts
import { NextUse } from 'midnext'

export async function middleware(request: Request) {
  return new NextUse(request)
  .use((req, res) => {
    req.cookies.set('req-c-1', '1')
    req.headers.set('req-h-1', '1')
  })
  .use((req, res) => {
    res.cookies.set('res-c-1', '2')
    res.headers.set('res-h-1', '2')
  })
  .run()
}

export const config = {}
```

## Rewrites
To rewrite a request, return `EdgeResponse.rewrite`. The next middleware will receive the `updated` request with the rewritten pathname.

```typescript
// middleware.ts
import { NextUse, EdgeRequest, EdgeResponse } from 'midnext'
import join from 'url-join'

export async function middleware(request: Request) {
  return new NextUse(request)
  .use((req: EdgeRequest, res: EdgeResponse) => {
    const url = new URL(req.url)
    url.pathname = join('test', url.pathname)  
  
    return EdgeResponse.rewrite(url)
  })
  .use((req, res) => {
    // Here, req.url's pathname starts with `test` due to the rewrite above
  })
  .run()
}

export const config = {}
```

## Redirects
Returning `EdgeResponse.redirect` will immediately stop further middleware execution and perform a redirect.

```typescript
// middleware.ts
import { NextUse, EdgeRequest, EdgeResponse } from 'midnext'
import join from 'url-join'

export async function middleware(request: Request) {
  return new NextUse(request)
  .use((req: EdgeRequest, res: EdgeResponse) => {
    req.cookies.set('req-c-1', '1')
    req.headers.set('req-h-1', '1')
  
    return EdgeResponse.redirect('http://test.com')
  })
  .use((req, res) => {
    // This middleware won't be executed since the redirect was returned above
  })
  .run()
}

export const config = {}
```

## Json
To override the response with JSON, use EdgeResponse.json. Like a redirect, this prevents further middleware execution.

```typescript
// middleware.ts
import { NextUse, EdgeRequest, EdgeResponse } from 'midnext'
import join from 'url-join'

export async function middleware(request: Request) {
  return new NextUse(request)
  .use((req: EdgeRequest, res: EdgeResponse) => {
    return EdgeResponse.json({ hello: 'world!' })
  })
  .use((req, res) => {
    // This middleware won't be executed since the JSON response was returned above
  })
  .run()
}

export const config = {}
```

## Sharing Data

To share data between multiple middleware, use the request.data property. This enables storing various types of data, including functions, for later use in the middleware chain.
```typescript
// middleware.ts
import { NextUse }  from 'midnext'

export async function middleware(request: NextRequest) {
  return new NextUse(request)
  .use((req, res) => {
    req.data.isBot = false;
    req.data.printHello = () => console.log('hello');
  })
  .use((req) => {
    console.log(req.data.isBot);
    req.data.printHello();
  })
  .run();
}

export const config = {};
```

Optionally, you can type the data field on request objects for TypeScript safety:

```typescript
// Optionally u can type the data field on request objects for TS safety
declare module 'midnext' {
  namespace EdgeRequest {
    interface Data {
      isBot: boolean;
      printHello:() => void
    }
  }
}
```

## API
Both `EdgeRequest` and `EdgeResponse` extend the standard Web Request and Response objects, meaning they support all their default properties and methods. 
Below, we list only the additional properties introduced by midnext.

### EdgeRequest Properties

| Property | Description                                                                                                |
|----------|------------------------------------------------------------------------------------------------------------|
| cookies  | Manages request cookies using [@edge-runtime/cookies](https://www.npmjs.com/package/@edge-runtime/cookies) |
| edgeUrl  | Provides the parsed URL object of the request.                                                             |
| data     | Stores shared data across middleware functions. Can hold any type, including functions.                    |


### EdgeResponse Properties
| Property | Description                                                                                                 |
|----------|-------------------------------------------------------------------------------------------------------------|
| cookies  | Manages response cookies using [@edge-runtime/cookies](https://www.npmjs.com/package/@edge-runtime/cookies) |
| rewrite  | Rewrites the request URL and `continues` middleware execution with the updated request.                     |
| redirect | Redirects to a new URL and halts further middleware execution.                                              |
| json     | Sends a JSON response and halts further middleware execution.                                               |
