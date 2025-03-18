import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { serialize } from 'cookie';
import { deleteMethodSchema } from '@schemas/methodSchema';
import { accessTokenSchema } from '@schemas/tokenSchema';

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
		const methodValidation = deleteMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts DELETE requests'
			});
		}

		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/',
			expires: new Date(0),
			maxAge: 0
		};

		res.setHeader('Set-Cookie', serialize('token', '', cookieOptions));

		const validationResult = accessTokenSchema.safeParse({
			token: req.cookies.token
		});

		if (!validationResult.success) {
			return res.status(401).json({
				// error: 'Authentication required',
				message: 'Valid authentication token cookie is required'
			});
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
