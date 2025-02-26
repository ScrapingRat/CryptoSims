'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from 'lib/actions/connect';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

/**
 * Checks if the user is authenticated by validating their JWT token
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */

export const isAuth = async (): Promise<boolean> => {
	try {
		await connectToDatabase();

		const cookieStore = cookies();
		const token = (await cookieStore).get('token')?.value;

		if (!token) {
			return false;
		}

		const decoded = jwt.verify(token, SECRET_KEY) as { walletId: string };

		if (!decoded.walletId) {
			return false;
		}

		return true;
	} catch (error) {
		console.error('Authentication check failed:', error);
		return false;
	}
};
