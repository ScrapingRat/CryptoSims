import refreshAccessToken from 'app/components/refreshAccessToken';

interface ApiResponse<T> {
	data?: T;
	error?: string;
	status: number;
	refreshed: boolean;
}

export async function apiWithRefresh<T>(
	url: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const fetchOptions: RequestInit = {
		...options,
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	};

	let response = await fetch(url, fetchOptions);
	let refreshed = false;

	if (response.status === 401) {
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
		if (!response.ok) {
			const errorData = await response.json();
			return {
				error:
					errorData.error ||
					`Request failed with status: ${response.status}`,
				status: response.status,
				refreshed
			};
		}

		const data = await response.json();
		return {
			data,
			status: response.status,
			refreshed
		};
	} catch (error) {
		console.error('Error parsing response:', error);
		return {
			error: 'Failed to parse server response',
			status: response.status,
			refreshed
		};
	}
}
