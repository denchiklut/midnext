import { RequestCookies } from '@edge-runtime/cookies'
import { EdgeRequest } from './request'

declare global {
	namespace Midnext {
		interface EdgeRequest {
			nonce: string
			user: { email: string }
		}
	}
}

describe('Request', () => {
	const url = 'https://example.com/path?query=1'

	it('should initialize with URL and default options', () => {
		const req = new EdgeRequest(url)

		expect(req.parsedUrl.href).toBe(url)
		expect(req.cookies).toBeInstanceOf(RequestCookies)
	})

	it('should initialize with an existing Request object', () => {
		const originalRequest = new Request(url, { method: 'GET' })
		const req = new EdgeRequest(originalRequest)

		expect(req.parsedUrl.href).toBe(url)
		expect(req.method).toBe('GET')
	})

	it('should allow setting and getting data', () => {
		const req = new EdgeRequest(url, { nonce: 'abc' })
		const user = { email: 'test-user' }
		req.user = user

		expect(req.user).toEqual(user)
		expect(req.nonce).toEqual('abc')
	})

	it('should handle request cookies', () => {
		const headers = new Headers({ Cookie: 'name=value' })
		const req = new EdgeRequest(url, { headers })
		req.cookies.set('test', 'abc')

		expect(req.cookies.get('name')?.value).toBe('value')
		expect(req.cookies.get('test')?.value).toBe('abc')
		expect(req.headers.get('cookie')).toBe('name=value; test=abc')
	})
})
