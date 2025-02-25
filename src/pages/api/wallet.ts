import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { connectToDatabase } from 'lib/actions/connect';
import Wallet from '@models/wallet';
import { generateAuthToken } from 'lib/token';

const seedPhraseSchema = z.object({
	seedPhrase: z.string().refine((value) => value.split(' ').length >= 12, {
		message: 'Seed phrase must be at least 12 words long'
	})
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const result = seedPhraseSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({ error: result.error.errors });
	}

	const { seedPhrase } = result.data;

	const { success, error } = await connectToDatabase();
	if (!success) {
		return res.status(500).json({ error });
	}

	try {
		const wallet = await Wallet.findOne({ seedPhrase });
		if (!wallet || !(await wallet.compareSeedPhrase(seedPhrase))) {
			return res.status(404).json({ error: 'Wallet not found' });
		}

		const token = generateAuthToken(wallet._id);

		res.status(200).json({ wallet, token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
}
