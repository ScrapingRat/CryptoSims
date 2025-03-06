import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

interface IWallet extends Document {
	seedPhrase: string;
	seedPhraseFingerprint: string;
	balance: number;
	compareSeedPhrase(candidateSeedPhrase: string): Promise<boolean>;
}

interface WalletModel extends mongoose.Model<IWallet> {
	findBySeedPhrase(seedPhrase: string): Promise<IWallet | null>;
}

const WalletSchema = new Schema({
	seedPhrase: { type: String, required: true, unique: true },
	seedPhraseFingerprint: { type: String, required: false, index: true },
	balance: { type: Number, required: true, default: 0 }
});

WalletSchema.pre<IWallet>('save', async function (next) {
	if (this.isModified('seedPhrase')) {
		const words = this.seedPhrase.trim().split(/\s+/).slice(0, 4);
		const fingerprint = crypto
			.createHash('sha256')
			.update(words.join(' '))
			.digest('hex');
		this.seedPhraseFingerprint = fingerprint;

		const salt = await bcrypt.genSalt(10);
		this.seedPhrase = await bcrypt.hash(this.seedPhrase, salt);
	}
	next();
});

WalletSchema.methods.compareSeedPhrase = async function (
	candidateSeedPhrase: string
) {
	if (!this.seedPhrase || typeof this.seedPhrase !== 'string') {
		throw new Error('Seed phrase is undefined');
	}

	const words = candidateSeedPhrase.trim().split(/\s+/);
	if (words.length !== 12) {
		return false;
	}

	return bcrypt.compare(candidateSeedPhrase, this.seedPhrase);
};

WalletSchema.statics.findBySeedPhrase = async function (seedPhrase: string) {
	const words = seedPhrase.trim().split(/\s+/);
	if (words.length !== 12) {
		return null;
	}

	const fingerprint = crypto
		.createHash('sha256')
		.update(words.slice(0, 4).join(' '))
		.digest('hex');

	const potentialWallets = await this.find({
		seedPhraseFingerprint: fingerprint
	});

	for (const wallet of potentialWallets) {
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
