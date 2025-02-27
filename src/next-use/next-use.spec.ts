import { NextUse } from './next-use'
import { EdgeRequest } from '../request'

describe('NextUse', () => {
	it('should add middleware with use method', () => {
		const instance = new NextUse({
			request: new EdgeRequest('http://example.com'),
			response: new Response()
		}).use(jest.fn())

		expect(instance['middlewares']).toHaveLength(1)
	})

	it('should run middleware that matches the path', async () => {
		const request = new EdgeRequest('http://example.com/test')
		const response = new Response()

		const instance = new NextUse({ request, response })
		const middleware = jest.fn()
		instance.use('/test', middleware)
		await instance.run()

		expect(middleware).toHaveBeenCalled()
	})

	it('should return a response if middleware returns one', async () => {
		const request = new EdgeRequest('https://example.com/test')
		const response = new Response()

		const instance = new NextUse({ request, response })
		const middleware = jest.fn(() => new Response('OK', { status: 200 }))

		instance.use('/test', middleware)
		const res = await instance.run()

		expect(res).toBeInstanceOf(Response)
		expect(res).toHaveTextBody('OK')
		expect(res).toHaveStatus(200)
	})

	it('should rewrite the request if middleware sets rewrite header', async () => {
		const request = new EdgeRequest('http://example.com')
		const response = new Response()

		const instance = new NextUse({ request, response })
		const middleware = jest.fn(
			() => new Response(null, { headers: { 'x-middleware-rewrite': 'http://example.com/new' } })
		)

		instance.use(middleware)
		await instance.run()

		expect(instance['req'].parsedUrl.pathname).toBe('/new')
	})

	it('should return redirect response if middleware sets a redirect status', async () => {
		const request = new EdgeRequest('http://example.com/redirect')
		const response = new Response()

		const instance = new NextUse({ request, response })
		const middleware = jest.fn(() => new Response(null, { status: 301, headers: { Location: '/new-location' } }))

		instance.use('/redirect', middleware)
		const res = await instance.run()

		expect(res).toBeInstanceOf(Response)
		expect(res).toHaveStatus(301)
		expect(res.headers.get('Location')).toBe('/new-location')
	})
})
