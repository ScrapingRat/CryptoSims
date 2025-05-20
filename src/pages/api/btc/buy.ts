import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import connectToDatabase from '@actions/connectToDatabase';
import Wallet from '@models/wallet';
import Order from '@models/order';
import Ohlc, { IOhlc } from '@models/ohlc';
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

		const { amount, limit } = req.query;

		if (!amount) {
			return res
				.status(400)
				.json({ error: 'Value parameter is required' });
		}

		const amountString = amount as string;
		const amountDecimalIndex = amountString.indexOf('.');

		if (
			amountDecimalIndex !== -1 &&
			amountString.length - amountDecimalIndex - 1 > 2
		) {
			return res
				.status(400)
				.json({ error: 'Amount can have at most 2 decimals.' });
		}

		const amountFiat: number = parseFloat(amountString);

		if (wallet.balanceFiat < amountFiat) {
			return res.status(400).json({
				error: 'Insufficient balance'
			});
		}

		if (amountFiat < 10) {
			return res.status(400).json({
				error: 'The minimum valid amount for a transaction is 10 USD'
			});
		}

		const timestamp = new Date().getTime() / 1000;

		if (limit) {
			const limitString = limit as string;
			const limitDecimalIndex = limitString.indexOf('.');

			if (
				limitDecimalIndex !== -1 &&
				limitString.length - limitDecimalIndex - 1 > 2
			) {
				return res
					.status(400)
					.json({ error: 'limit can have at most 2 decimals.' });
			}

			const limitFiat: number = parseFloat(limitString);

			const order = await Order.place(
				walletId,
				amountFiat,
				limitFiat,
				'buy',
			);

			if (!order.success) {
				return res.status(400).json({ error: order.message });
			}

			return res.status(200).json({
				message: `Limit buy order placed: ${amountFiat} USD at BTC = ${limitFiat} USD`
			});
		}

		const data: IOhlc | null = await Ohlc.findByTimestamp(timestamp);

		if (!data) {
			return res.status(400).json({
				error: 'No data found',
				message: 'No OHLC data found for the specified timestamp'
			});
		}

		const amountBtc = parseFloat(((1 / data.close) * amountFiat).toFixed(8));

		const buyBtc = await Wallet.buyBtc(walletId, amountBtc, amountFiat);

		if (!buyBtc.success) {
			return res.status(400).json({ error: buyBtc.message });
		}

		return res.status(200).json({
			message: buyBtc.message
		});
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
