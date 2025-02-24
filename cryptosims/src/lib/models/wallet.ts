import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IWallet extends Document {
	seedPhrase: string;
	balance: number;
}

const WalletSchema: Schema = new Schema({
	seedPhrase: { type: String, required: true, unique: true },
	balance: { type: Number, required: true, default: 0 }
});

WalletSchema.pre('save', async function (next) {
	if (!this.isModified('seedPhrase')) return next();
	const salt = await bcrypt.genSalt(10);
	this.seedPhrase = await bcrypt.hash(this.seedPhrase as string, salt);
	next();
});

WalletSchema.methods.compareSeedPhrase = async function (
	candidateSeedPhrase: string
) {
	if (!this.seedPhrase) {
		throw new Error('Seed phrase is undefined');
	}
	return bcrypt.compare(candidateSeedPhrase, this.seedPhrase);
};

export default mongoose.models.Wallet ||
	mongoose.model<IWallet>('Wallet', WalletSchema);
