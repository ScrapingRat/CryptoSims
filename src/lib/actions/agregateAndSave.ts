'use server';

import Ohlc from '@models/ohlc';
import fs from 'fs';
import { PipelineStage } from 'mongoose';

// const INTERVALS = [60, 300, 3600, 86400]; // 1m, 5m, 1h, 1d in seconds
const INTERVALS = [1296000, 86400];

async function aggregateAndSave(interval: number) {
	let pipeline: PipelineStage[] = [];

	if (interval === 86400) {
		// Only include data up to one year from now
		const now = Math.floor(Date.now() / 1000);
		const oneYearFromNow = now - 365 * 24 * 60 * 60;

		pipeline = [
			{
				$match: {
					timestamp: { $gte: oneYearFromNow },
				},
			},
			{
				$group: {
					_id: {
						$toLong: {
							$subtract: [
								'$timestamp',
								{ $mod: ['$timestamp', interval] },
							],
						},
					},
					open: { $first: '$open' },
					high: { $max: '$high' },
					low: { $min: '$low' },
					close: { $last: '$close' },
					volume: { $sum: '$volume' },
					timestamp: { $first: '$timestamp' },
				},
			},
			{ $sort: { _id: 1 } },
		];
	} else {
		pipeline = [
			{
				$group: {
					_id: {
						$toLong: {
							$subtract: [
								'$timestamp',
								{ $mod: ['$timestamp', interval] },
							],
						},
					},
					open: { $first: '$open' },
					high: { $max: '$high' },
					low: { $min: '$low' },
					close: { $last: '$close' },
					volume: { $sum: '$volume' },
					timestamp: { $first: '$timestamp' },
				},
			},
			{ $sort: { _id: 1 } },
		];
	}

	const data = await Ohlc.aggregate(pipeline);
	fs.writeFileSync(`./public/ohlc_${interval}.json`, JSON.stringify(data));
}

const agreagte = async () => {
	try {
		for (const interval of INTERVALS) {
			await aggregateAndSave(interval);
		}
		console.log('Aggregation and saving completed successfully.');
	} catch (error) {
		console.error('Error during aggregation and saving:', error);
	}
};

export default agreagte;
