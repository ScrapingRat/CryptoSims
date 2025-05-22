'use server';

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import connectToDatabase from './connectToDatabase';
import Ohlc from '../models/ohlc';
import { Transform } from 'stream';

interface OhlcDataInput {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

const update = async () => {
	const BATCH_SIZE = 3000;
	let batchBuffer: OhlcDataInput[] = [];
	let totalProcessed = 0;
	let successCount = 0;
	let failCount = 0;
	const startTime = Date.now();

	const dbConnected = await connectToDatabase();
	if (!dbConnected.success) {
		console.error('Failed to connect to database');
		return false;
	}

	console.log('Ensuring indexes are created...');
	await Ohlc.collection.createIndex({ timestamp: 1 }, { unique: true });

	async function processBatch(batch: OhlcDataInput[]): Promise<void> {
		if (batch.length === 0) return;

		try {
			const bulkOps = batch.map((record) => ({
				updateOne: {
					filter: { timestamp: record.timestamp },
					update: { $set: record },
					upsert: true
				}
			}));

			const result = await Ohlc.collection.bulkWrite(bulkOps, {
				ordered: false
			});
			successCount += result.upsertedCount + result.modifiedCount;

			if (totalProcessed % 10000 === 0) {
				const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
				const rate = (totalProcessed / parseFloat(elapsed)).toFixed(1);
				console.log(
					`Processed ${totalProcessed.toLocaleString()} records (${rate}/sec)`
				);
			}
		} catch (error) {
			console.error(
				`Error processing batch of ${batch.length} records:`,
				error
			);
			failCount += batch.length;
		}
	}

	return new Promise<boolean>((resolve, reject) => {
		const csvPath = path.resolve(process.cwd(), 'data.csv');
		console.log(`Streaming data from ${csvPath}`);

		const transformer = new Transform({
			objectMode: true,
			transform(chunk, encoding, callback) {
				try {
					const record: OhlcDataInput = {
						timestamp: parseFloat(chunk.Timestamp),
						open: parseFloat(chunk.Open),
						high: parseFloat(chunk.High),
						low: parseFloat(chunk.Low),
						close: parseFloat(chunk.Close),
						volume: parseFloat(chunk.Volume)
					};
					this.push(record);
					callback();
				} catch (err) {
					callback(err as Error);
				}
			}
		});

		fs.createReadStream(csvPath)
			.pipe(csv())
			.pipe(transformer)
			.on('data', async (data: OhlcDataInput) => {
				batchBuffer.push(data);
				totalProcessed++;

				if (batchBuffer.length >= BATCH_SIZE) {
					transformer.pause();
					await processBatch(batchBuffer);
					batchBuffer = [];
					transformer.resume();
				}
			})
			.on('end', async () => {
				await processBatch(batchBuffer);

				const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
				console.log(`
=== Import Complete ===
Total Records: ${totalProcessed.toLocaleString()}
Success: ${successCount.toLocaleString()}
Failed: ${failCount.toLocaleString()}
Time: ${elapsed}s
Rate: ${(totalProcessed / parseFloat(elapsed)).toFixed(1)} records/sec
        `);

				resolve(failCount === 0);
			})
			.on('error', (error) => {
				console.error('Error processing CSV:', error);
				reject(error);
			});
	});
};

export default update;
