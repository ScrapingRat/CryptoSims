import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import connectToDatabase from '@actions/connectToDatabase';
import Wallet from '@models/wallet';
import authorizeToken from 'lib/authorizeToken';
import { postMethodSchema } from '@schemas/methodSchema';

const ROUTE_ENABLED = true;

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

		const auth = await authorizeToken(req);

		if (!auth.isAuthorized) {
			return res.status(401).json({ error: auth.error });
		}

		const walletId = auth.walletId || 'null';
		const wallet = await Wallet.findById(walletId);

		if (!wallet) {
			return res.status(401).json({ error: 'Wallet not found' });
		}

		const { amount } = req.query;

		if (!amount) {
			return res
				.status(400)
				.json({ error: 'Value parameter is required' });
		}

		const amountString = amount as string;
		const decimalIndex = amountString.indexOf('.');

		if (decimalIndex !== -1 && amountString.length - decimalIndex - 1 > 2) {
			return res
				.status(400)
				.json({ error: 'Amount can have at most 2 decimals.' });
		}

		const amountFiat: number = parseFloat(amountString);

		if (amountFiat < 10) {
			return res.status(400).json({
				error: 'The minimum valid amount for a transaction is 10 USD'
			});
		}

		// const timestamp = new Date().getTime() / 1000;

		const { success, message } = await Wallet.incFiat(walletId, amountFiat);

		if (!success) {
			return res.status(400).json({ error: message });
		}

		return res.status(200).json({ message });
	} catch (error) {
		res.status(401).json({ error });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
};

export default handler;
