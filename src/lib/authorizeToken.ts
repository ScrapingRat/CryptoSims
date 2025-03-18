import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import getConfig from 'lib/getConfig';
import { accessTokenSchema } from '@schemas/tokenSchema';

const { SECRET_KEY } = getConfig();

interface AuthResult {
	isAuthorized: boolean;
	walletId?: string;
	error?: string;
}

export async function authorizeToken(req: NextApiRequest): Promise<AuthResult> {
	try {
		const tokenValidation = accessTokenSchema.safeParse({
			token: req.cookies.token
		});

		if (!tokenValidation.success) {
			return {
				isAuthorized: false,
				error: `Authentication failed: ${tokenValidation.error.issues[0].message}`
			};
		}

		const decoded = jwt.verify(tokenValidation.data.token, SECRET_KEY, {
			ignoreExpiration: false,
			algorithms: ['HS256']
		}) as {
			walletId: string;
			exp?: number;
			iat?: number;
		};

		if (!decoded) {
			return {
				isAuthorized: false,
				error: 'Invalid token'
			};
		}

		const now = new Date();
		console.info(
			`${now.toLocaleDateString()} ${now.toLocaleTimeString()}: Authentication successful for walletId: ${
				decoded.walletId
			}`
		);

		return {
			isAuthorized: true,
			walletId: decoded.walletId
		};
	} catch (error) {
		console.error('Token authorization error:', error);

		if (error instanceof jwt.TokenExpiredError) {
			return {
				isAuthorized: false,
				error: 'Token expired'
			};
		} else if (error instanceof jwt.JsonWebTokenError) {
			return {
				isAuthorized: false,
				error: 'Invalid token format or signature'
			};
		} else if (error instanceof jwt.NotBeforeError) {
			return {
				isAuthorized: false,
				error: 'Token not active yet'
			};
		} else {
			return {
				isAuthorized: false,
				error: `Authentication error: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			};
		}
	}
}
