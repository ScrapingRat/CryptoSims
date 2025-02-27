'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import getConfig from 'lib/getConfig';
import connectToDatabase from 'lib/actions/connectToDatabase';

const { SECRET_KEY } = getConfig();

const isAuth = async (): Promise<boolean> => {
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

export default isAuth;
