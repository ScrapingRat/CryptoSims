import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
// import connectToDatabase from '@actions/connectToDatabase';
import { postMethodSchema } from '@schemas/methodSchema';
import refreshAccessToken from 'lib/refreshAccessToken';

const ROUTE_ENABLED = true;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	try {
		// const dbConnected = await connectToDatabase();

		// if (!dbConnected.success)
		// {
		// 	return res.status(500).json({
		// 		error: 'Connection to the database failed'
		// 	})
		// }

		const methodValidation = postMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts POST requests'
			});
		}

		const refreshResult = await refreshAccessToken(req);

		if (!refreshResult.success) {
			const statusCode = refreshResult.error?.includes('expired')
				? 401
				: refreshResult.error?.includes('Invalid')
				? 401
				: refreshResult.error?.includes('No refresh token')
				? 401
				: 500;

			return res.status(statusCode).json({
				error: refreshResult.error,
				message: refreshResult.message
			});
		}

		const accessCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/',
			maxAge: refreshResult.expiresIn
		};

		res.setHeader(
			'Set-Cookie',
			serialize('token', refreshResult.accessToken!, accessCookieOptions)
		);

		return res.status(200).json({
			message: refreshResult.message,
			expiresIn: refreshResult.expiresIn
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({
				error: 'Validation error',
				message: error.issues[0].message
			});
		} else if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				error: 'Invalid token format',
				message: 'The provided token is invalid'
			});
		} else if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				error: 'Token expired',
				message: 'Please log in again'
			});
		} else {
			console.error('Error refreshing token:', error);
			return res.status(500).json({
				error: 'Server error',
				message: 'Could not refresh token'
			});
		}
	}
};

export default handler;
