import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IWallet extends Document {
	seedPhrase: string;
	balance: number;
	compareSeedPhrase(candidateSeedPhrase: string): Promise<boolean>;
}

interface WalletModel extends mongoose.Model<IWallet> {
	findBySeedPhrase(seedPhrase: string): Promise<IWallet | null>;
}

const WalletSchema = new Schema({
	seedPhrase: { type: String, required: true, unique: true },
	balance: { type: Number, required: true, default: 0 }
});

WalletSchema.pre<IWallet>('save', async function (next) {
	if (!this.isModified('seedPhrase')) return next();
	const salt = await bcrypt.genSalt(10);
	this.seedPhrase = await bcrypt.hash(this.seedPhrase, salt);
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

WalletSchema.statics.findBySeedPhrase = async function (seedPhrase: string) {
	const wallets = await this.find({});
	for (const wallet of wallets) {
		const isMatch = await wallet.compareSeedPhrase(seedPhrase);
		if (isMatch) {
			return wallet;
		}
	}
	return null;
};

const Wallet =
	(mongoose.models.Wallet as WalletModel) ||
	mongoose.model<IWallet, WalletModel>('Wallet', WalletSchema);
export default Wallet;
