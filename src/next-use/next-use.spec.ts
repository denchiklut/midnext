import { next } from '@vercel/edge'
import { NextUse } from './next-use'

describe('NextUse', () => {
	it('should add middleware with use method', () => {
		const instance = new NextUse({
			request: new Request('https://example.com')
		})
			.use(jest.fn())
			.use(jest.fn())

		expect(instance['middlewares']).toHaveLength(2)
		expect(instance['res']).toBeInstanceOf(Response)
	})

	it('should run middleware that matches the path', async () => {
		const request = new Request('https://example.com/test')
		const middleware1 = jest.fn()
		const middleware2 = jest.fn()
		const middleware3 = jest.fn()

		await new NextUse({ request })
			.use(jest.fn(() => next()))
			.use(/.*/, middleware1)
			.use('/test', middleware2)
			.use('/abc', middleware3)
			.run()

		expect(middleware1).toHaveBeenCalled()
		expect(middleware2).toHaveBeenCalled()
		expect(middleware3).not.toHaveBeenCalled()
	})

	it('should return a response if middleware returns one', async () => {
		const request = new Request('https://example.com/test-path')
		const res = await new NextUse({ request })
			.use('/test-path', () => new Response('Hello world!', { status: 200 }))
			.run()

		expect(res).toBeInstanceOf(Response)
		expect(res).toHaveTextBody('Hello world!')
		expect(res).toHaveStatus(200)
	})

	it('should rewrite the request if middleware returns a rewrite', async () => {
		const request = new Request('https://example.com')

		const instance = new NextUse({ request }).use((_req, res) => {
			return res.rewrite('https://example.com/new')
		})
		await instance.run()

		expect(instance['req'].parsedUrl.pathname).toBe('/new')
	})

	it('should return redirect response if middleware sets a redirect status', async () => {
		const request = new Request('https://example.com/redirect')

		const res = await new NextUse({ request })
			.use('/redirect', (_req, res) => {
				return res.redirect('https://example.com/new-location', 301)
			})
			.run()

		expect(res).toBeInstanceOf(Response)
		expect(res).toHaveStatus(301)
		expect(res.headers.get('Location')).toBe('https://example.com/new-location')
	})
})
