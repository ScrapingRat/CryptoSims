interface RefreshResult {
	success: boolean;
	message?: string;
	error?: string;
	expiresIn?: number;
}

const refreshAccessToken = async (): Promise<RefreshResult> => {
	try {
		const response = await fetch('/api/refresh', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();

		if (response.ok) {
			return {
				success: true,
				message: data.message,
				expiresIn: data.expiresIn
			};
		}

		if (response.status === 401) {
			console.error(data.error, data.message);
			return {
				success: false,
				error: 'Session expired. Please log in again.'
			};
		}

		if (response.status === 405) {
			console.error(data.error, data.message);
			return {
				success: false,
				error: 'API method not allowed'
			};
		}

		if (response.status >= 500) {
			console.error(data.error, data.message);
			return {
				success: false,
				error: 'Server error. Please try again later.'
			};
		}

		console.error(data.error, data.message);
		return {
			success: false,
			error: data.error || 'Failed to refresh token'
		};
	} catch (error) {
		console.error('Network error while refreshing token:', error);
		return {
			success: false,
			error: 'Network error. Please check your connection.'
		};
	}
};

export default refreshAccessToken;
