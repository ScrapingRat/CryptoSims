import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

export interface AuthTokenPayload {
	walletId: string;
}

export function verifyToken(
	req: NextApiRequest,
	res: NextApiResponse
): AuthTokenPayload | null {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.status(401).json({ error: 'Missing Authorization header' });
		return null;
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, SECRET_KEY) as AuthTokenPayload;
		return decoded;
	} catch (error) {
		console.log(error);
		res.status(401).json({ error: 'Invalid or expired token' });
		return null;
	}
}
