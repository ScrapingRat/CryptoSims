import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Ohlc from './ohlc';

interface IWallet extends Document {
	seedPhrase: string;
	seedPhraseFingerprint: string;
	balanceFiat: number;
	balanceBtc: number;
	purchaseFiat: [string, Date, number];
	purchaseBtc: [string, Date, number, number];
	openOrders: [string, Date, number, number, string];
	compareSeedPhrase(candidateSeedPhrase: string): Promise<boolean>;
}

interface WalletModel extends mongoose.Model<IWallet> {
	findBySeedPhrase(seedPhrase: string): Promise<IWallet | null>;
	// purchaseFiat(amount: number): Promise<string | null>;
	incFiat(
		walletId: string,
		amount: number,
		purchaseId?: string
	): { success: boolean; message: string; purchaseId: string };
	decFiat(
		walletId: string,
		amount: number,
		purchaseId?: string
	): { success: boolean; message: string; purchaseId: string };
	incBtc(
		walletId: string,
		amountBtc: number,
		amountFiat: number,
		purchaseId?: string
	): { success: boolean; message: string; purchaseId: string };
	decBtc(
		walletId: string,
		amount: number,
		purchaseId?: string
	): { success: boolean; message: string; purchaseId: string };
	diff(walletId: string): { netProfit: number; percentProfit: number };
}

const WalletSchema = new Schema({
	seedPhrase: { type: String, required: true, unique: true },
	seedPhraseFingerprint: { type: String, required: false, index: true },
	balanceFiat: {
		type: Number,
		required: true,
		default: 0,
		min: [0, 'Balance cannot go below zero.'],
		set: (v: number) => Math.round(v * 1e2) / 1e2
	},
	purchaseFiat: { type: Array, required: false },
	balanceBtc: {
		type: Number,
		required: true,
		default: 0,
		min: [0, 'Balance cannot go below zero.'],
		set: (v: number) => Math.round(v * 1e8) / 1e8
	},
	purchaseBtc: { type: Array, required: false },
	openOrders: { type: Array, required: false }
});

WalletSchema.index({ seedPhradeFingerprint: 1 });

WalletSchema.pre<IWallet>('save', async function (next) {
	if (this.isModified('seedPhrase')) {
		const words = this.seedPhrase.trim().split(/\s+/).slice(0, 4);
		const fingerprint = crypto
			.createHash('sha256')
			.update(words.join(' '))
			.digest('hex');
		this.seedPhraseFingerprint = fingerprint;

		const hash = crypto
			.createHash('sha256')
			.update(this.seedPhrase)
			.digest('hex');

		const salt = await bcrypt.genSalt(10);
		this.seedPhrase = await bcrypt.hash(hash, salt);
	}
	next();
});

WalletSchema.methods.compareSeedPhrase = async function (
	candidateSeedPhrase: string
) {
	if (!this.seedPhrase || typeof this.seedPhrase !== 'string') {
		throw new Error('Seed phrase is missing or invalid');
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

	const hash = crypto.createHash('sha256').update(seedPhrase).digest('hex');

	const potentialWallets = await this.find({
		seedPhraseFingerprint: fingerprint
	});

	for (const wallet of potentialWallets) {
		const isMatch = await wallet.compareSeedPhrase(hash);
		if (isMatch) {
			return wallet;
		}
	}
	return null;
};

WalletSchema.statics.incFiat = async function (
	walletId: string,
	amount: number,
	purchaseId: ObjectId
) {
	if (amount < 0) {
		console.error(`incFiat error: Negative amount attempted: ${amount}`);
		return {
			success: false,
			message: 'Amount cannot be negative.'
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`incFiat error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	const date = new Date();

	if (!purchaseId) {
		purchaseId = new ObjectId();
	}

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceFiat:
					Math.round((wallet.balanceFiat + amount) * 1e2) / 1e2
			},
			$push: { purchaseFiat: [purchaseId, date, amount] }
		},
		{ new: true, runValidators: true }
	);

	if (!updatedWallet) {
		console.error(
			`incFiat error: Wallet with ID ${walletId} not found or update failed.`
		);
		return { success: false, message: `Failed to update wallet balance.` };
	}

	return {
		success: true,
		message: `Successfully increased USD by ${amount}. New balance is ${updatedWallet.balanceFiat}.`,
		purchaseId
	};
};

WalletSchema.statics.decFiat = async function (
	walletId: string,
	amount: number,
	purchaseId: ObjectId
) {
	if (amount < 0) {
		console.error(`incFiat error: Negative amount attempted: ${amount}`);
		return {
			success: false,
			message: 'Amount cannot be negative.',
			purchaseId: purchaseId
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`decFiat error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	if (wallet.balanceFiat < amount) {
		console.error(
			`decFiat error: Insufficient balance. Wallet ID: ${walletId}, Current Balance: ${wallet.balanceFiat}, Requested: -${amount}`
		);
		return { success: false, message: `Insufficient balance.` };
	}

	const date = new Date();

	if (!purchaseId) {
		purchaseId = new ObjectId();
	}

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceFiat:
					Math.round((wallet.balanceFiat - amount) * 1e2) / 1e2
			},
			$push: { purchaseFiat: [purchaseId, date, -amount] }
		},
		{ new: true, runValidators: true, context: 'query' }
	);

	if (!updatedWallet) {
		console.error(
			`decFiat error: Something went wrong updating wallet with ID ${walletId}.`
		);
		return { success: false, message: `Failed to update wallet balance.` };
	}

	return {
		success: true,
		message: `Successfully decreased USD by ${amount}. New balance is ${updatedWallet.balanceFiat}.`,
		purchaseId
	};
};

WalletSchema.statics.incBtc = async function (
	walletId: string,
	amountBtc: number,
	amountFiat: number,
	purchaseId: ObjectId
) {
	if (amountBtc < 0) {
		console.error(`incBtc error: Negative amount attempted: ${amountBtc}`);
		return {
			success: false,
			message: 'Amount cannot be negative.'
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`incBtc error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	const date = new Date();

	if (!purchaseId) {
		purchaseId = new ObjectId();
	}

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceBtc:
					Math.round((wallet.balanceBtc + amountBtc) * 1e8) / 1e8
			},
			$push: { purchaseBtc: [purchaseId, date, amountBtc, amountFiat] }
		},
		{ new: true, runValidators: true }
	);

	if (!updatedWallet) {
		console.error(
			`incBtc error: Wallet with ID ${walletId} not found or update failed.`
		);
		return { success: false, message: `Failed to update wallet balance.` };
	}

	return {
		success: true,
		message: `Successfully increased BTC by ${amountBtc}. New balance is ${updatedWallet.balanceBtc}.`,
		purchaseId
	};
};

WalletSchema.statics.decBtc = async function (
	walletId: string,
	amount: number,
	purchaseId: ObjectId
) {
	if (amount < 0) {
		console.error(`decBtc error: Negative amount attempted: ${amount}`);
		return {
			success: false,
			message: 'Amount cannot be negative.'
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`decBtc error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	if (wallet.balanceBtc < amount) {
		console.error(
			`decBtc error: Insufficient balance. Wallet ID: ${walletId}, Current Balance: ${wallet.balanceBtc}, Requested: -${amount}`
		);
		return { success: false, message: `Insufficient balance.` };
	}

	const date = new Date();

	if (!purchaseId) {
		purchaseId = new ObjectId();
	}

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceBtc: Math.round((wallet.balanceBtc - amount) * 1e8) / 1e8
			},
			$push: { purchaseBtc: [purchaseId, date, -amount] }
		},
		{ new: true, runValidators: true, context: 'query' }
	);

	if (!updatedWallet) {
		console.error(
			`decBtc error: Something went wrong updating wallet with ID ${walletId}.`
		);
		return { success: false, message: `Failed to update wallet balance.` };
	}

	return {
		success: true,
		message: `Successfully decreased BTC by ${amount}. New balance is ${updatedWallet.balanceBtc}.`,
		purchaseId
	};
};

WalletSchema.statics.diff = async function (walletId: string) {
	const wallet = await this.findById(walletId);

	let totalFiatSpent = 0;

	for (const [, , , fiatAmount] of wallet.purchaseBtc || []) {
		totalFiatSpent += fiatAmount;
	}

	const timestamp = Date.now() / 1000;

	const data = await Ohlc.findByTimestamp(timestamp);

	const btcValue =
		Math.round((data?.close || 0) * wallet.balanceBtc * 1e2) / 1e2;
	const netProfit = btcValue - totalFiatSpent;
	const percentProfit = (netProfit / totalFiatSpent) * 100;

	return {
		netProfit: Math.round(netProfit * 1e2) / 1e2,
		percentProfit: Math.round(percentProfit * 1e2) / 1e2
	};
};

const Wallet =
	(mongoose.models.Wallet as WalletModel) ||
	mongoose.model<IWallet, WalletModel>('Wallet', WalletSchema);

export default Wallet;
