import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import getConfig from 'lib/getConfig';
import lockWalletSchema from '@schemas/lockWalletSchema';

const { SECRET_KEY } = getConfig();
const ROUTE_ENABLED = true;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	res.setHeader('Content-Type', 'application/json');
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	try {
		const validationResult = lockWalletSchema.safeParse({
			method: req.method,
			cookies: req.cookies
		});

		if (!validationResult.success) {
			if (
				validationResult.error.issues.some((issue) =>
					issue.path.includes('method')
				)
			) {
				return res.status(405).json({
					error: 'Method not allowed',
					message: 'This endpoint only accepts DELETE requests'
				});
			}

			return res.status(401).json({
				error: 'Authentication required',
				message: 'Valid authentication token cookie is required'
			});
		}

		const { token } = validationResult.data.cookies;

		const decoded = jwt.verify(token, SECRET_KEY) as { walletId: string };
		if (!decoded.walletId) {
			return res.status(401).json({ error: 'Failed to lock wallet' });
		}

		return res.status(200).json({ message: 'Wallet locked successfully' });
	} catch (error) {
		res.status(401).json({ error: 'Failed to lock wallet' });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Failed to lock wallet:', error);
		}
	}
}
