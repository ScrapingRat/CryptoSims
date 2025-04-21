import { NextApiRequest, NextApiResponse } from 'next';
import Ohlc, { IOhlc } from '@models/ohlc';
import connectToDatabase from '@actions/connectToDatabase';
import authorizeToken from 'lib/authorizeToken';
import { getMethodSchema } from '@schemas/methodSchema';

const ROUTE_ENABLED = true;
const MAX_RANGE_MINUTES = 60 * 24 * 7;

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

		const auth = await authorizeToken(req);

		if (!auth.isAuthorized) {
			return res.status(401).json({ error: auth.error });
		}

		const { date, from, to } = req.query;

		if (!date && !from && !to) {
			return res
				.status(400)
				.json({ error: 'Date parameter is required' });
		}

		if (date && !from && !to) {
			let timestamp: number;

			try {
				if (/^\d+$/.test(date as string)) {
					timestamp = parseInt(date as string, 10);
				} else {
					timestamp = new Date(date as string).getTime() / 1000;
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
				return res.status(400).json({
					error: 'No data found',
					message: 'No OHLC data found for the specified timestamp'
				});
			}

			return res.status(200).json(data);
		} else if (!date && from && to) {
			let timestampFrom: number;
			let timestampTo: number;

			try {
				if ((/^\d+$/.test(from as string)) && (/^\d+$/.test(to as string))) {
					timestampFrom = parseInt(from as string, 10);
					timestampTo = parseInt(to as string, 10);
				} else {
					timestampFrom = new Date(from as string).getTime() / 1000;
					timestampTo = new Date(to as string).getTime() / 1000;
				}

				if (isNaN(timestampFrom) || isNaN(timestampTo)) {
					throw new Error('Invalid date format');
				}

				if (timestampFrom === timestampTo) {
					throw new Error('Timestamps are the same');
				}

				if (timestampFrom > timestampTo) {
					throw new Error('Invalid range');
				}

				const rangeMinutes = (timestampTo - timestampFrom) / 60;
				if (rangeMinutes > MAX_RANGE_MINUTES) {
					return res.status(400).json({
						error: 'Range too large',
						message: `The maximum allowed range is ${MAX_RANGE_MINUTES} minutes (${
							MAX_RANGE_MINUTES / 60 / 24
						} days)`
					});
				}
			} catch (error) {
				return res.status(400).json({
					error: (error as Error).message,
					message:
						'Please provide date as a Unix timestamp or ISO date string'
				});
			}

			const data: IOhlc[] | null = await Ohlc.findByRange(
				timestampFrom,
				timestampTo
			);

			if (!data) {
				return res.status(400).json({
					error: 'No data found',
					message: 'No OHLC data found for the specified timestamp'
				});
			}

			return res.status(200).json(data);
		}
	} catch (error) {
		console.error('Error fetching BTC value:', error);
		return res.status(500).json({
			error: 'Server error',
			message: 'Failed to retrieve BTC value'
		});
	}
};

export default handler;
