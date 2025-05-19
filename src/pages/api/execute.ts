import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'lib/getConfig';
import { postMethodSchema } from '@schemas/methodSchema';
import connectToDatabase from '@actions/connectToDatabase';
import { listOrders } from '@actions/listOrders';
import WebSocket from 'ws';

const { API_KEY } = getConfig();
const ROUTE_ENABLED = true;

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@trade';

const getRealtimeBTCPrice = (): Promise<number> => {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(BINANCE_WS_URL);
		ws.on('message', (data: string) => {
			try {
				const parsed = JSON.parse(data);
				if (parsed.p) {
					ws.close();
					resolve(parseFloat(parsed.p));
				}
			} catch (e) {
				ws.close();
				reject(e);
			}
		});
		ws.on('error', (err: Error) => {
			ws.close();
			reject(err);
		});
		// Timeout after 5 seconds
		setTimeout(() => {
			ws.close();
			reject(new Error('Timeout getting BTC price from Binance'));
		}, 5000);
	});
};

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

		const apiKey = req.headers['x-api-key'];
		if (apiKey !== API_KEY) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const dbConnected = await connectToDatabase();

		if (!dbConnected.success) {
			return res.status(500).json({
				error: 'Connection to the database failed'
			});
		}

		const openOrders = await listOrders();

		if (!openOrders.length) {
			return res.status(404).json({ error: 'No open orders found' });
		}

		const btcPrice = await getRealtimeBTCPrice();

		const results = [];

		for (const order of openOrders) {
			const executionResult = await order.execute(btcPrice);
			results.push({
				orderId: order._id,
				executionResult
			});
		}

		return res.status(200).json({
			btcPrice,
			results
		});
	} catch (error) {
		return res
			.status(500)
			.json({ error: error instanceof Error ? error.message : error });
	}
};

export default handler;
