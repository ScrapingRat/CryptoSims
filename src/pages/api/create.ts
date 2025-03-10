import { NextApiRequest, NextApiResponse } from 'next';
import * as bip39 from 'bip39';
import Wallet from '@models/wallet';
import connectToDatabase from 'lib/actions/connectToDatabase';

const ROUTE_ENABLED = true;

function generateRandomInteger(min: number, max: number) {
	return Math.floor(min + Math.random() * (max - min + 1));
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This API endpoint is temporarily disabled' });
	}

	await connectToDatabase();

	try {
		let seedPhrase: string = bip39.generateMnemonic(128);
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

		res.status(200).json({ seedPhrase, balance: wallet.balance });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to create new wallet' });
	}
}
