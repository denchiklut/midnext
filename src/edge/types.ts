export interface ExtraResponseInit extends Omit<ResponseInit, 'headers'> {
    /**
     * These headers will be sent to the user response
     * along with the response headers from the origin.
     */
    headers?: HeadersInit;
    /**
     * Fields to rewrite for the upstream request.
     */
    request?: {
        headers?: Headers;
    };
}

export interface MiddlewareResponseInit extends ResponseInit {
    /**
     * These fields will override the request from clients.
     */
    request?: {
        headers?: Headers;
    };
}