import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import getConfig from 'lib/getConfig';
import connectToDatabase from '@actions/connectToDatabase';
import Wallet from '@models/wallet';
import { postMethodSchema } from '@schemas/methodSchema';
import seedBodySchema from '@schemas/seedBodySchema';
import rateLimit from 'lib/rateLimit';

const { SECRET_KEY, SECRET_KEY_REFRESH } = getConfig();
const ROUTE_ENABLED = true;

// const ACCESS_TOKEN_EXPIRY = 1;
const ACCESS_TOKEN_EXPIRY = 15 * 60;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	try {
		const methodValidation = postMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts POST requests'
			});
		}

		const bodyValidation = seedBodySchema.safeParse(req.body);

		if (!bodyValidation.success) {
			return res.status(400).json({
				error: 'Invalid request',
				message: bodyValidation.error.issues[0].message
			});
		}

		const dbConnected = await connectToDatabase();

		if (!dbConnected.success) {
			return res.status(500).json({
				error: 'Connection to the database failed'
			});
		}

		const { seedPhrase } = bodyValidation.data;

		const wallet = (await Wallet.findBySeedPhrase(seedPhrase)) as {
			_id: string;
		} | null;

		if (!wallet) {
			return res.status(401).json({ error: 'Authentication failed' });
		}

		const now = Math.floor(Date.now() / 1000);

		const accessToken = jwt.sign(
			{
				walletId: wallet._id,
				type: 'access',
				iat: now,
				nbf: now,
				exp: now + ACCESS_TOKEN_EXPIRY,
				jti: crypto.randomUUID(),
				iss: process.env.JWT_ISSUER || 'cryptosims',
				sub: wallet._id.toString()
			},
			SECRET_KEY,
			{
				algorithm: 'HS256'
			}
		);

		const refreshToken = jwt.sign(
			{
				walletId: wallet._id,
				type: 'refresh',
				iat: now,
				nbf: now,
				exp: now + REFRESH_TOKEN_EXPIRY,
				jti: crypto.randomUUID(),
				iss: process.env.JWT_ISSUER || 'cryptosims',
				sub: wallet._id.toString()
			},
			SECRET_KEY_REFRESH,
			{
				algorithm: 'HS256'
			}
		);

		const accessCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/',
			maxAge: ACCESS_TOKEN_EXPIRY
		};

		const refreshCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/api/refresh',
			maxAge: REFRESH_TOKEN_EXPIRY
		};

		const visitedCookieOptions = {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			path: '/',
			maxAge: REFRESH_TOKEN_EXPIRY
		};

		res.setHeader('Set-Cookie', [
			serialize('token', accessToken, accessCookieOptions),
			serialize('refresh_token', refreshToken, refreshCookieOptions),
			serialize('unlocked_before', '', visitedCookieOptions)
		]);

		return res.status(200).json({
			message: 'Authentication successful',
			expiresIn: ACCESS_TOKEN_EXPIRY
		});
	} catch (error) {
		res.status(401).json({ error: 'Authentication failed' });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
};

export default rateLimit(3, 1 * 60 * 1000)(handler);
