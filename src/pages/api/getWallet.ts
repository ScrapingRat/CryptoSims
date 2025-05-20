import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import connectToDatabase from '@actions/connectToDatabase';
import Wallet from '@models/wallet';
import authorizeToken from 'lib/authorizeToken';
import { getMethodSchema } from '@schemas/methodSchema';

const ROUTE_ENABLED = true;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	try {
		const methodValidation = getMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts GET requests'
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

		const walletId = auth.walletId;

		const wallet = await Wallet.findById(walletId);

		if (!walletId) {
			return res.status(400).json({ error: 'Invalid wallet ID' });
		}

		const { netProfit, percentProfit } = await Wallet.diff(walletId);

		if (!wallet) {
			return res.status(401).json({ error: 'Wallet not found' });
		}

		return res.status(200).json({
			balanceFiat: wallet.balanceFiat,
			balanceBtc: wallet.balanceBtc,
			netProfit,
			percentProfit,
			historyFiat: wallet.depositHistory,
			historyBtc: wallet.orderHistory,
			openOrders: wallet.openOrders
		});
	} catch (error) {
		res.status(401).json({ error: 'Authentication failed' });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
};

export default handler;
