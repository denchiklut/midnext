import { rewrite } from '@vercel/edge'
import { EdgeResponse } from './response'

jest.mock('@vercel/edge', () => ({
	rewrite: jest.fn(() => new Response(null, { status: 200 }))
}))

describe('Response', () => {
	test('should allow setting and retrieving cookies', () => {
		const response = new EdgeResponse()
		response.cookies.set('test', 'value')

		expect(response.cookies.get('test')?.value).toBe('value')
		expect(response.headers.get('set-cookie')).toBe('test=value; Path=/')
	})

	test('should rewrite response', () => {
		const destination = 'https://example.com'
		new EdgeResponse().rewrite(destination)

		expect(rewrite).toHaveBeenCalledWith(destination)
	})

	test('should redirect with custom status', () => {
		const redirectUrl = 'https://example.com'
		const response = new EdgeResponse().redirect(redirectUrl, 302)

		expect(response).toHaveStatus(302)
		expect(response.headers.get('Location')).toBe(redirectUrl)
	})

	test('should throw error for invalid redirect status', () => {
		expect(() => new EdgeResponse().redirect('https://example.com', 400)).toThrow(
			'Failed to execute "redirect" on "response": Invalid status code'
		)
	})

	test('should create EdgeResponse from an existing Response', () => {
		const originalResponse = new Response('Hello', { status: 200 })
		const edgeResponse = EdgeResponse.from(originalResponse)

		expect(edgeResponse).toBeInstanceOf(EdgeResponse)
		expect(edgeResponse).toHaveStatus(200)
		expect(edgeResponse).toHaveTextBody('Hello')
	})
})
