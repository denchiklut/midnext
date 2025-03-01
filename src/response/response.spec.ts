import { rewrite } from '@vercel/edge'
import { EdgeResponse } from './response'

jest.mock('@vercel/edge', () => ({
	rewrite: jest.fn()
}))

describe('Response', () => {
	it('should allow setting and retrieving cookies', () => {
		const response = new EdgeResponse()
		response.cookies.set('test', 'value')

		expect(response.cookies.get('test')?.value).toBe('value')
		expect(response.headers.get('set-cookie')).toBe('test=value; Path=/')
	})

	it('should rewrite response', () => {
		const destination = 'https://example.com'
		new EdgeResponse().rewrite(destination)

		expect(rewrite).toHaveBeenCalledWith(destination)
	})

	it.each([
		['numeric status', 302],
		['object status', { status: 302 }]
	])('should redirect with custom status (%s)', (_, status) => {
		const redirectUrl = 'https://example.com'
		const response = new EdgeResponse().redirect(redirectUrl, status)

		expect(response).toHaveStatus(302)
		expect(response.headers.get('Location')).toBe(redirectUrl)
	})

	it('should redirect with default status', () => {
		const redirectUrl = 'https://example.com'
		const response = new EdgeResponse().redirect(redirectUrl)

		expect(response).toHaveStatus(307)
		expect(response.headers.get('Location')).toBe(redirectUrl)
	})

	it('should throw error for invalid redirect status', () => {
		expect(() => new EdgeResponse().redirect('https://example.com', 400)).toThrow(
			'Failed to execute "redirect" on "response": Invalid status code'
		)
	})

	it('should create EdgeResponse from an existing Response', () => {
		const originalResponse = new Response('Hello world!', { status: 200 })
		const edgeResponse = EdgeResponse.from(originalResponse)

		expect(edgeResponse).toBeInstanceOf(EdgeResponse)
		expect(edgeResponse).toHaveTextBody('Hello world!')
		expect(edgeResponse).toHaveStatus(200)
	})
})
