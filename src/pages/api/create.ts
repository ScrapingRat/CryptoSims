import { NextApiRequest, NextApiResponse } from 'next';
import * as bip39 from 'bip39';
import { ZodError } from 'zod';
import Wallet from '@models/wallet';
import connectToDatabase from '@actions/connectToDatabase';
import { postMethodSchema } from '@schemas/methodSchema';
import rateLimit from 'lib/rateLimit';

const ROUTE_ENABLED = true;

function generateRandomInteger(min: number, max: number) {
	return Math.floor(min + Math.random() * (max - min + 1));
}

function generateRandomBitcoin(min: number, max: number): number {
	const randomValue = min + Math.random() * (max - min);

	return Math.round(randomValue * 100000000) / 100000000;
}

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

		const dbConnected = await connectToDatabase();

		if (!dbConnected.success) {
			return res.status(500).json({
				error: 'Connection to the database failed'
			});
		}

		let seedPhrase = bip39.generateMnemonic(128);
		let existingWallet = await Wallet.findBySeedPhrase(seedPhrase);

		while (existingWallet) {
			seedPhrase = bip39.generateMnemonic(128);
			existingWallet = await Wallet.findBySeedPhrase(seedPhrase);
		}

		const wallet = new Wallet({
			seedPhrase,
			balanceFiat: generateRandomInteger(0, 1000),
			balanceBtc: generateRandomBitcoin(0, 10)
		});

		await wallet.save();
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({ seedPhrase, balanceFiat: wallet.balanceFiat });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create new wallet' });

		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error(error);
		}
	}
};

export default rateLimit(3, 5 * 60 * 1000)(handler);
