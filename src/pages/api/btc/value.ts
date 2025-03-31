import { NextApiRequest, NextApiResponse } from 'next';
import Ohlc, { IOhlc } from '@models/ohlc';
import connectToDatabase from '@actions/connectToDatabase';
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
			return res
				.status(500)
				.json({ error: 'Database connection failed' });
		}

		const { date } = req.query;

		console.log(date);
		if (!date) {
			return res
				.status(400)
				.json({ error: 'Date parameter is required' });
		}

		let timestamp: number;

		try {
			if (/^\d+$/.test(date as string)) {
				timestamp = parseInt(date as string, 10);
			}
			else {
				timestamp = new Date(date as string).getTime() / 1000;
				console.log(timestamp);
			}

			if (isNaN(timestamp)) {
				throw new Error('Invalid date format');
			}
		} catch {
			return res.status(400).json({
				error: 'Invalid date format',
				message:
					'Please provide date as a Unix timestamp or ISO date string'
			});
		}

		const data: IOhlc | null = await Ohlc.findByTimestamp(timestamp);

		if (!data) {
			return res.status(404).json({
				error: 'No data found',
				message: 'No OHLC data found for the specified timestamp'
			});
		}

		console.log(data);
		return res.status(200).json(data);
	} catch (error) {
		console.error('Error fetching BTC value:', error);
		return res.status(500).json({
			error: 'Server error',
			message: 'Failed to retrieve BTC value'
		});
	}
};

export default handler;
