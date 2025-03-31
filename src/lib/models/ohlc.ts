import mongoose, { Schema, Document } from 'mongoose';

interface IOhlc extends Document {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface OhlcModel extends mongoose.Model<IOhlc> {
	findByTimestamp(timestamp: number): Promise<IOhlc | null>;
	findExactTimestamp(timestamp: number): Promise<IOhlc | null>;
}

const OhlcSchema = new Schema({
	timestamp: { type: Number, required: true, unique: true, index: true },
	open: { type: Number, required: true },
	high: { type: Number, required: true },
	low: { type: Number, required: true },
	close: { type: Number, required: true },
	volume: { type: Number, required: true }
});

// OhlcSchema.index({ timestamp: 1 });

OhlcSchema.statics.findByTimestamp = async function (
	timestamp: number
): Promise<IOhlc | null> {
	const exact = await this.findOne({ timestamp });

	if (exact) return exact;

	const before = await this.findOne({ timestamp: { $lt: timestamp } })
		.sort({ timestamp: -1 })
		.limit(1);
	console.log(before);

	return before;
};

OhlcSchema.statics.findExactTimestamp = async function (
	timestamp: number
): Promise<IOhlc | null> {
	return this.findOne({ timestamp });

};

const Ohlc =
	(mongoose.models.Ohlc as OhlcModel) ||
	mongoose.model<IOhlc, OhlcModel>('Ohlc', OhlcSchema);

export default Ohlc;
export type { IOhlc };
