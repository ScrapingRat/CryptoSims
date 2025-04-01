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
				path: '/api/create',
				method: 'POST',
				description:
					'Genereate a new wallet with a unique seed phrase.',
				response: {
					seedPhrase: 'string'
				},
				example: `curl -X POST http://localhost:3000/api/create`
			},

			{
				path: '/api/unlock',
				method: 'POST',
				description: 'Unlock a wallet using the associated seed.',
				headers: [
					{
						name: 'Content-Type',
						type: 'application/json',
						description: 'Indicates the request body is JSON.',
						required: true
					}
				],
				body: {
					seedPhrase: 'string'
				},
				response: {
					message: 'string',
					expiresIn: 'number',
					cookies: [
						{
							name: 'token',
							description:
								'A secure cookie containing the authentication token.',
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production'
						},
						{
							name: 'refresh_token',
							description:
								'A secure cookie containing the refresh token.',
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production'
						},
						{
							name: 'unlocked_before',
							description:
								'A cookie used by the front-end to know when to fetch the authorization',
							httpOnly: false,
							secure: process.env.NODE_ENV === 'production'
						}
					]
				},
				examples: [
					`curl -X POST http://localhost:3000/api/unlock -H "Content-Type: application/json" -d '{"seedPhrase": "your-seed-phrase"}' -c cookie.jar`,
					`curl -X POST http://localhost:3000/api/unlock -H "Content-Type: application/json" -d @seed.json -c cookie.jar`
				]
			},

			{
				path: '/api/lock',
				method: 'DELETE',
				description:
					'Lock the wallet by clearing all authentication cookies.',
				cookies: [
					{
						name: 'token',
						description: 'The access token cookie to be cleared.',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						required: true
					}
				],
				response: {
					message: 'string'
				},
				example: `curl -X DELETE http://localhost:3000/api/lock -b @token.jar`
			},

			{
				path: '/api/refresh',
				method: 'POST',
				description:
					'Refresh the access token using the refresh token.',
				cookie: {
					name: 'refresh_token',
					description:
						'A secure cookie containing the refresh token used to generate a new access token',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					required: true
				},
				response: {
					message: 'string',
					expiresIn: 'number',
					cookie: {
						name: 'token',
						description:
							'A secure cookie containing the new access token.',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'strict',
						path: '/',
						maxAge: 'Expires in the duration of the new access token.'
					}
				},
				example: `curl -X POST http://localhost:3000/api/refresh -b @refresh_token.jar -c access_token.jar`
			},

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
			},

			{
				path: '/api/update',
				method: 'POST',
				description: 'Trigger an update of OHLC data.',
				headers: [
					{
						name: 'x-api-key',
						type: 'string',
						description: 'API key for authentication.',
						required: true
					}
				],
				example:
					'curl -X POST http://localhost:3000/api/update -H "x-api-key: your-api-key"'
			}
		]
	});
};

export default handler;
