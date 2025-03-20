import refreshAccessToken from 'lib/refreshAccessToken';

interface ApiResponse<T> {
	data?: T;
	error?: string;
	errorMessage?: string;
	status: number;
	refreshed: boolean;
}

interface ApiOptions extends RequestInit {
	params?: Record<string, string>;
	body?: BodyInit | null | undefined;
	auth?: boolean;
}

const apiClient = async <T>(
	url: string,
	method: string = 'GET',
	options: ApiOptions = {}
): Promise<ApiResponse<T>> => {
	const requireAuth = options.auth !== false;

	let finalUrl = url;
	if (options.params) {
		const queryParams = new URLSearchParams();
		Object.entries(options.params).forEach(([key, value]) => {
			queryParams.append(key, value);
		});
		finalUrl = `${url}${
			url.includes('?') ? '&' : '?'
		}${queryParams.toString()}`;
	}

	let body = options.body;
	if (body && typeof body === 'object' && !(body instanceof FormData)) {
		body = JSON.stringify(body);
	}

	const fetchOptions: RequestInit = {
		...options,
		method,
		body,
		...(requireAuth ? { credentials: 'same-origin' } : {}),
		headers: {
			...(body && !(body instanceof FormData)
				? { 'Content-Type': 'application/json' }
				: {}),
			...(options.headers || {})
		}
	};

	interface ExtendedRequestInit extends RequestInit {
		params?: Record<string, string>;
		auth?: boolean;
	}

	delete (fetchOptions as ExtendedRequestInit).params;
	delete (fetchOptions as ExtendedRequestInit).auth;

	let response: Response;
	let refreshed = false;

	try {
		response = await fetch(finalUrl, fetchOptions);
	} catch (networkError) {
		console.error(`Network error for ${method} ${finalUrl}:`, networkError);
		return {
			error: 'Network error. Please check your connection.',
			status: 0,
			refreshed: false
		};
	}

	if (response.status === 400) {
		try {
			const data = await response.json();

			return {
				error: 'Invalid request',
				errorMessage:
					data.message || 'The request contains invalid data',
				status: 400,
				refreshed: false
			};
		} catch {
			return {
				error: 'Invalid request',
				errorMessage: 'Bad request format',
				status: 400,
				refreshed: false
			};
		}
	}

	if (requireAuth && response.status === 401) {
		try {
			const refreshResult = await refreshAccessToken();

			if (refreshResult.success) {
				response = await fetch(url, fetchOptions);
				refreshed = true;
			} else {
				return {
					error:
						refreshResult.error ||
						'Session expired. Please log in again.',
					status: 401,
					refreshed: false
				};
			}
		} catch (refreshError) {
			console.error('Error during token refresh:', refreshError);
			return {
				error: 'Authentication error',
				status: 401,
				refreshed: false
			};
		}
	}

	try {
		if (
			response.status === 204 ||
			response.headers.get('content-length') === '0'
		) {
			return {
				data: {} as T,
				status: response.status,
				refreshed
			};
		}

		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();

			if (!response.ok) {
				return {
					error:
						data.error ||
						`Request failed with status: ${response.status}`,
					errorMessage: data.message,
					status: response.status,
					refreshed
				};
			}

			return {
				data,
				status: response.status,
				refreshed
			};
		} else {
			const text = await response.text();

			if (!response.ok) {
				return {
					error:
						text ||
						`Request failed with status: ${response.status}`,
					status: response.status,
					refreshed
				};
			}

			return {
				data: { text } as unknown as T,
				status: response.status,
				refreshed
			};
		}
	} catch (error) {
		console.error('Error parsing response:', error);
		return {
			error: 'Failed to parse server response',
			status: response.status,
			refreshed
		};
	}
};

export default apiClient;
