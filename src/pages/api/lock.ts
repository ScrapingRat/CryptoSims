import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const ROUTE_ENABLED = true;

// Schema that requires a token in the request body
const requestSchema = z.object({
	token: z.string().min(1)
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({
			error: 'Method not allowed',
			message: 'Only POST requests are accepted'
		});
	}

	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This API endpoint is temporarily disabled' });
	}

	try {
		// Validate the request body has a token
		const validationResult = requestSchema.safeParse(req.body);

		if (!validationResult.success) {
			return res.status(400).json({
				error: 'Invalid request',
				message: 'Token is required in request body',
				details: validationResult.error.format()
			});
		}

		const { token } = validationResult.data;

		// Process the token - in this case we're simply acknowledging the lock request
		// No need to clear browser cookies since we're not using them

		return res.status(200).json({ message: 'Wallet locked successfully' });
	} catch (error) {
		console.error('Failed to lock wallet:', error);
		return res.status(401).json({ error: 'Failed to lock wallet' });
	}
}
