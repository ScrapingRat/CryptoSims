import { NextApiRequest, NextApiResponse } from 'next';

const rateLimit = (limit: number, interval: number) => {
	const requests = new Map();
	interface RequestData {
		count: number;
		firstRequest: number;
	}

	setInterval(() => {
		const now = Date.now();
		for (const [ip, data] of requests.entries()) {
			if (now - data.firstRequest > interval * 2) {
				requests.delete(ip);
			}
		}
	}, interval);

	return (
		handler: (
			req: NextApiRequest,
			res: NextApiResponse
		) => Promise<void> | void
	) => {
		return async (req: NextApiRequest, res: NextApiResponse) => {
			const ip =
				(Array.isArray(req.headers['x-forwarded-for'])
					? req.headers['x-forwarded-for'][0]
					: req.headers['x-forwarded-for']) ||
				req.socket.remoteAddress;

			const ipAddress =
				typeof ip === 'string'
					? ip
					: Array.isArray(ip)
					? ip[0]
					: '127.0.0.1';

			if (!requests.has(ipAddress)) {
				requests.set(ipAddress, {
					count: 0,
					firstRequest: Date.now()
				} as RequestData);
			}

			const data = requests.get(ipAddress) as RequestData;

			if (Date.now() - data.firstRequest > interval) {
				data.count = 0;
				data.firstRequest = Date.now();
			}

			res.setHeader('X-RateLimit-Limit', limit);
			res.setHeader(
				'X-RateLimit-Remaining',
				Math.max(0, limit - (data.count + 1))
			);
			res.setHeader(
				'X-RateLimit-Reset',
				Math.ceil((data.firstRequest + interval) / 1000)
			);

			if (data.count + 1 > limit) {
				return res.status(429).json({
					error: 'Too many requests, please try again later.'
				});
			}

			requests.set(ipAddress, {
				count: data.count + 1,
				firstRequest: data.firstRequest
			});

			return handler(req, res);
		};
	};
};

export default rateLimit;
