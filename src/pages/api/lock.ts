import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { serialize } from 'cookie';
import { deleteMethodSchema } from '@schemas/methodSchema';
import rateLimit from 'lib/rateLimit';

const ROUTE_ENABLED = true;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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

		const accessCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/',
			expires: new Date(0),
			maxAge: 0
		};

		const refreshCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/api/refresh',
			expires: new Date(0),
			maxAge: 0
		};

		const visitedCookieOptions = {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/',
			expires: new Date(0),
			maxAge: 0
		};

		res.setHeader('Set-Cookie', [
			serialize('token', '', accessCookieOptions),
			serialize('refresh_token', '', refreshCookieOptions),
			serialize('unlocked_before', '', visitedCookieOptions)
		]);

		return res.status(200).json({ message: 'Wallet locked successfully' });
	} catch (error) {
		res.status(401).json({ error: 'Failed to lock wallet' });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Failed to lock wallet:', error);
		}
	}
};

// export default handler;
export default rateLimit(3, 1 * 60 * 1000)(handler);
