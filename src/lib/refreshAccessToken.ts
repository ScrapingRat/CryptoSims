import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import getConfig from 'lib/getConfig';
import {
	refreshTokenSchema,
	typeRefreshTokenSchema
} from '@schemas/tokenSchema';
import crypto from 'crypto';

const { SECRET_KEY, SECRET_KEY_REFRESH } = getConfig();
const ACCESS_TOKEN_EXPIRY = 15 * 60;

interface RefreshResult {
	success: boolean;
	accessToken?: string;
	error?: string;
	message?: string;
	expiresIn?: number;
}

const refreshAccessToken = async (
	req: NextApiRequest
): Promise<RefreshResult> => {
	try {
		let refreshToken = req.cookies.refresh_token;

		if (!refreshToken && req.body && req.body.refresh_token) {
			refreshToken = req.body.refresh_token;
		}

		if (!refreshToken) {
			return {
				success: false,
				error: 'No refresh token provided',
				message: 'Please provide a refresh token'
			};
		}

		const tokenValidation = refreshTokenSchema.safeParse({
			refresh_token: refreshToken
		});

		if (!tokenValidation.success) {
			return {
				success: false,
				error: `Authentication failed: ${tokenValidation.error.issues[0].message}`
			};
		}

		try {
			const decoded = jwt.verify(
				tokenValidation.data.refresh_token,
				SECRET_KEY_REFRESH,
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
				return {
					success: false,
					error: `Invalid token type: ${tokenTypeValidation.error.issues[0].message}`
				};
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

			return {
				success: true,
				accessToken,
				message: 'Token refreshed successfully',
				expiresIn: ACCESS_TOKEN_EXPIRY
			};
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				return {
					success: false,
					error: 'Refresh token expired',
					message: 'Please log in again'
				};
			}

			return {
				success: false,
				error: 'Invalid refresh token',
				message: 'Please log in again'
			};
		}
	} catch (error) {
		console.error('Error in refreshServerToken:', error);
		return {
			success: false,
			error: 'Server error',
			message: 'Could not refresh token'
		};
	}
};

export default refreshAccessToken;
