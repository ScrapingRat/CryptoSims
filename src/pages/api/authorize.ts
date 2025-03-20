import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import connectToDatabase from '@actions/connectToDatabase';
import { getMethodSchema } from '@schemas/methodSchema';
import { authorizeToken } from 'lib/authorizeToken';

const ROUTE_ENABLED = true;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	await connectToDatabase();

	try {
		const methodValidation = getMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts GET requests'
			});
		}

		const auth = await authorizeToken(req);

		if (!auth.isAuthorized) {
			return res.status(401).json({
				isAuthorized: auth.isAuthorized,
				error: auth.error
			});
		}

		return res.status(200).json({
			isAuthorized: auth.isAuthorized,
			message: 'Authentication successful',
		});
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({ error: 'Invalid token format' });
		} else if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ error: 'Token expired' });
		} else if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
			return res.status(400).json({ error: 'Invalid request format' });
		} else {
			console.error('Authentication error:', error);
			return res.status(500).json({ error: 'Internal server error' });
		}
	}
}
