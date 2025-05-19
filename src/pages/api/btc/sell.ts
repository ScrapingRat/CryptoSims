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
			method: req.method,
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts POST requests',
			});
		}

		const dbConnected = await connectToDatabase();

		if (!dbConnected.success) {
			return res.status(500).json({
				error: 'Connection to the database failed',
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
		const decimalIndex = amountString.indexOf('.');

		if (decimalIndex !== -1 && amountString.length - decimalIndex - 1 > 8) {
			return res
				.status(400)
				.json({ error: 'Amount can have at most 8 decimals.' });
		}

		const amountBtc: number = parseFloat(amountString);

		if (wallet.balanceBtc < amountBtc) {
			return res.status(400).json({
				error: 'Insufficient balance',
			});
		}

		if (amountBtc < 0.0001) {
			return res.status(400).json({
				error: 'The minimum valid amount for a transaction is 0.0001 BTC',
			});
		}

		const timestamp = new Date().getTime() / 1000;

		const data: IOhlc | null = await Ohlc.findByTimestamp(timestamp);

		if (!data) {
			return res.status(400).json({
				error: 'No data found',
				message: 'No OHLC data found for the specified timestamp',
			});
		}

		const btcDec = await Wallet.decBtc(walletId, amountBtc);

		if (!btcDec.success) {
			return res.status(400).json({ error: btcDec.message });
		}

		const fiatAmount = parseFloat((data.close * amountBtc).toFixed(2));

		// LIMIT //
		if (limit) {
			const limitString = limit as string;
			const limitDecimalIndex = limitString.indexOf('.');

			if (
				limitDecimalIndex !== -1 &&
				limitString.length - limitDecimalIndex - 1 > 8
			) {
				return res
					.status(400)
					.json({ error: 'limit can have at most 8 decimals.' });
			}

			const limitFiat: number = parseFloat(limitString);

			const btcDec = await Wallet.decBtc(walletId, amountBtc);

			if (!btcDec.success) {
				return res.status(400).json({ error: btcDec.message });
			}

			const order = await Order.place(
				walletId,
				amountBtc,
				limitFiat,
				'sell',
				btcDec.purchaseId
			);

			if (!order.success) {
				await Wallet.incBtc(walletId, amountBtc, fiatAmount);
				return res.status(400).json({ error: order.message });
			}

			const walletOrder = await Wallet.place(
				walletId,
				order.id,
				amountBtc,
				limitFiat,
				'sell'
			);

			if (!walletOrder.success) {
				await Wallet.incBtc(walletId, amountBtc, fiatAmount);
				return res.status(400).json({ error: walletOrder.message });
			}

			return res.status(200).json({
				message: `Limit sell order placed: ${amountBtc} BTC at ${limitFiat} USD (Order ID: ${order.id})`,
			});
		}
		// LIMIT //

		const fiatInc = await Wallet.incFiat(
			walletId,
			fiatAmount,
			true,
			btcDec.purchaseId
		);

		if (!fiatInc.success) {
			const { success, message } = await Wallet.incBtc(
				walletId,
				amountBtc,
				fiatAmount
			);

			if (!success) {
				return res
					.status(400)
					.json({ error: `${message}, ${fiatInc.message}` });
			}
			return res.status(400).json({ error: fiatInc.message });
		}

		return res.status(200).json({
			message: `Purchased ${fiatAmount} USD for ${amountBtc} BTC`,
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
