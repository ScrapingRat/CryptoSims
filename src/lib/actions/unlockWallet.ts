'use server';

import { z } from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Wallet from '@models/wallet';
import { connectToDatabase } from 'lib/actions/connect';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const unlockSchema = z.object({
	seedPhrase: z
		.string()
		.min(1, 'Seed phrase is required')
		.refine((val) => val.split(' ').length === 12, {
			message: 'Seed phrase must be exactly 12 words'
		})
});

export async function unlockWallet(formData: FormData) {
	const seedPhrase = formData.get('seedPhrase') as string;

	try {
		await connectToDatabase();

		unlockSchema.parse({ seedPhrase });

		const wallet = await Wallet.findBySeedPhrase(seedPhrase);
		if (!wallet) {
			return { error: 'Wallet not found' };
		}

		const token = jwt.sign(
			{
				walletId: wallet._id,
				iat: Math.floor(Date.now() / 1000),
				jti: crypto.randomUUID()
			},
			SECRET_KEY,
			{
				expiresIn: '1h',
				algorithm: 'HS256'
			}
		);

		(await cookies()).set({
			name: 'token',
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 3600,
			path: '/',
			sameSite: 'strict',
			domain: process.env.DOMAIN
		});

		return { success: true, message: 'Wallet unlocked successfully' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { error: error.issues[0].message };
		}
		console.error(error);
		return { error: 'Failed to unlock wallet' };
	}
}
