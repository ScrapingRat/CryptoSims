const getConfig = () => {
	const SECRET_KEY = process.env.SECRET_KEY || 'fallback-dev-only-secret';
	const SECRET_KEY_REFRESH =
		process.env.SECRET_KEY_REFRESH || 'fallback-dev-only-secret';
	const API_KEY = process.env.API_KEY || 'fallback-dev-only-secret';
	const DOMAIN = process.env.DOMAIN || 'localhost';

	if (
		process.env.NODE_ENV === 'production' &&
		SECRET_KEY === 'fallback-dev-only-secret'
	) {
		throw new Error('Production environment missing SECRET_KEY');
	}

	return {
		SECRET_KEY,
		SECRET_KEY_REFRESH,
		API_KEY,
		MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
		DOMAIN
	};
};

export default getConfig;
