import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'lib/getConfig';
import { postMethodSchema } from '@schemas/methodSchema';
import connectToDatabase from '@actions/connectToDatabase';
import { listOrders } from '@actions/listOrders';

const { API_KEY } = getConfig();
const ROUTE_ENABLED = true;


const getRealtimeBTCPrice = async (): Promise<number> => {
	try {
		const response = await fetch('http://localhost:3001');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data.formattedPrice;
	} catch (error) {
		throw new Error(`HTTP error! status: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
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
