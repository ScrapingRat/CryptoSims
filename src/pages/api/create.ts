import { NextApiRequest, NextApiResponse } from 'next';
import * as bip39 from 'bip39';
import { ZodError } from 'zod';
import Wallet from '@models/wallet';
import connectToDatabase from '@actions/connectToDatabase';
import { postMethodSchema } from '@schemas/methodSchema';

const ROUTE_ENABLED = true;

function generateRandomInteger(min: number, max: number) {
	return Math.floor(min + Math.random() * (max - min + 1));
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
			balance: generateRandomInteger(0, 1000)
		});

		await wallet.save();
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({ seedPhrase, balance: wallet.balance });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create new wallet' });

		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error(error);
		}
	}
};

export default handler;
