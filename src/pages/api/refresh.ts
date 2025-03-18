import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import getConfig from 'lib/getConfig';
import { postMethodSchema } from '@schemas/methodSchema';
import {
	refreshTokenSchema,
	typeRefreshTokenSchema
} from '@schemas/tokenSchema';
import crypto from 'crypto';

const { SECRET_KEY } = getConfig();
const ACCESS_TOKEN_EXPIRY = 15 * 60;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
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

		const tokenValidation = refreshTokenSchema.safeParse({
			refresh_token: req.cookies.refresh_token
		});

		if (!tokenValidation.success) {
			return res.status(405).json({
				error: `Authentication failed: ${tokenValidation.error.issues[0].message}`
			});
		}

		try {
			const decoded = jwt.verify(
				tokenValidation.data.refresh_token,
				SECRET_KEY,
				{
					algorithms: ['HS256']
				}
			) as {
				walletId: string;
				type: string;
				exp: number;
			};

			const tokenTypeValidation = typeRefreshTokenSchema.safeParse({
				type: decoded.type
			});

			if (!tokenTypeValidation.success) {
				return res.status(405).json({
					error: `Invalid token type: ${tokenTypeValidation.error.issues[0].message}`
				});
			}

			const now = Math.floor(Date.now() / 1000);
			const accessToken = jwt.sign(
				{
					walletId: decoded.walletId,
					type: 'access',
					iat: now,
					nbf: now,
					exp: now + ACCESS_TOKEN_EXPIRY,
					jti: crypto.randomUUID(),
					iss: process.env.JWT_ISSUER || 'cryptosims',
					sub: decoded.walletId
				},
				SECRET_KEY,
				{ algorithm: 'HS256' }
			);

			const accessCookieOptions = {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict' as const,
				path: '/',
				maxAge: ACCESS_TOKEN_EXPIRY
			};

			res.setHeader(
				'Set-Cookie',
				serialize('token', accessToken, accessCookieOptions)
			);
			return res.status(200).json({
				message: 'Token refreshed successfully',
				expiresIn: ACCESS_TOKEN_EXPIRY
			});
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				return res.status(401).json({
					error: 'Refresh token expired',
					message: 'Please log in again'
				});
			}
			return res.status(401).json({
				error: 'Invalid refresh token',
				message: 'Please log in again'
			});
		}
	} catch (error) {
		console.error('Error refreshing token:', error);
		return res.status(500).json({
			error: 'Server error',
			message: 'Could not refresh token'
		});
	}
}
