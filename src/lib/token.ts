import jwt from 'jsonwebtoken';
import getConfig from './getConfig';

const { SECRET_KEY } = getConfig();

export function generateAuthToken(walletId: string) {
	if (!SECRET_KEY) {
		throw new Error('Secret key not set');
	}
	return jwt.sign({ walletId }, SECRET_KEY, { expiresIn: '1h' });
}
