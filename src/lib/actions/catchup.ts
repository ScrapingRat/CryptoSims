'use server';

import axios from 'axios';
import connectToDatabase from './connectToDatabase';
import Ohlc from '../models/ohlc';

interface OhlcDataInput {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

const BATCH_SIZE = 1000;
const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

const fetchBinanceOHLCV = async (
	symbol: string,
	interval: string,
	startTime: number,
	endTime: number
) => {
	const response = await axios.get(BINANCE_API_URL, {
		params: {
			symbol,
			interval,
			startTime,
			endTime,
			limit: 1000
		}
	});
	return response.data.map(
		(entry: [number, string, string, string, string, string]) => ({
			timestamp: entry[0] / 1000,
			open: parseFloat(entry[1]),
			high: parseFloat(entry[2]),
			low: parseFloat(entry[3]),
			close: parseFloat(entry[4]),
			volume: parseFloat(entry[5])
		})
	);
};

const catchup = async () => {
	const dbConnected = await connectToDatabase();
	if (!dbConnected.success) {
		console.error('Failed to connect to database');
		return false;
	}

	console.log('Ensuring indexes are created...');
	await Ohlc.collection.createIndex({ timestamp: 1 }, { unique: true });

	const now = Math.floor(Date.now() / 1000);
	const lastEntry = await Ohlc.findOne().sort({ timestamp: -1 });
	let startTime = lastEntry?.timestamp
		? lastEntry.timestamp * 1000
		: now * 1000;
	let endTime = startTime + 60 * 1000 * BATCH_SIZE;

	while (startTime < now * 1000) {
		try {
			console.log(
				`Fetching data from ${new Date(
					startTime
				).toISOString()} to ${new Date(endTime).toISOString()}`
			);
			const ohlcvData = await fetchBinanceOHLCV(
				'BTCUSDT',
				'1m',
				startTime,
				endTime
			);

			if (ohlcvData.length === 0) {
				console.log('No new data available.');
				break;
			}

			const bulkOps = ohlcvData.map((record: OhlcDataInput) => ({
				updateOne: {
					filter: { timestamp: record.timestamp },
					update: { $set: record },
					upsert: true
				}
			}));

			const result = await Ohlc.collection.bulkWrite(bulkOps, {
				ordered: false
			});
			console.log(
				`Inserted ${result.upsertedCount} new records, updated ${result.modifiedCount} records.`
			);

			startTime =
				ohlcvData[ohlcvData.length - 1].timestamp * 1000 + 60 * 1000;
			endTime = startTime + 60 * 1000 * BATCH_SIZE;
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error fetching or inserting data:', error.message);
			} else {
				console.error('Error fetching or inserting data:', error);
			}
			break;
		}
	}

	console.log('Catchup complete.');
	return true;
};

export default catchup;
