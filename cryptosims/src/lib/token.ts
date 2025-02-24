import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

export function generateAuthToken(walletId: string) {
	if (!SECRET_KEY) {
		throw new Error('Secret key not set');
	}
	return jwt.sign({ walletId }, SECRET_KEY, { expiresIn: '1h' });
}
