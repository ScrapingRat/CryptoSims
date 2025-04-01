import { NextApiRequest, NextApiResponse } from 'next';

const ROUTE_ENABLED = true;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	return res.status(200).json({
		message: 'Welcome to the CryptoSims API!',
		routes: [
			{
				path: '/api/btc/value',
				method: 'GET',
				description:
					'Fetch OHLC data for a specific timestamp or range.',
				queryParameters: [
					{
						name: 'date',
						type: 'string',
						description:
							'A specific timestamp (ISO string or Unix timestamp).',
						required: false
					},
					{
						name: 'from',
						type: 'string',
						description:
							'Start of the range (ISO string or Unix timestamp).',
						required: false
					},
					{
						name: 'to',
						type: 'string',
						description:
							'End of the range (ISO string or Unix timestamp).',
						required: false
					}
				],
				examples: [
					'curl -X GET http://localhost:3000/api/btc/value?date=1609459200',
					'curl -X GET http://localhost:3000/api/btc/value?date=2021-01-01',
					'curl -X GET http://localhost:3000/api/btc/value?date=2021-01-01T00:01:00',
					'curl -X GET http://localhost:3000/api/btc/value?from=2021-01-01T00:00:00&to=2021-01-02T00:00:00'
				]
			}
		]
	});
};

export default handler;
