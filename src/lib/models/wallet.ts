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
	totalFiat: number;
	openOrders: [string, Date, number, number, string];
	orderHistory: [string, Date, number, number, string];
	depositHistory: [string, Date, number];
	compareSeedPhrase(candidateSeedPhrase: string): Promise<boolean>;
	buyBtc(
		walletId: string,
		amountBtc: number,
		amountFiat: number
	): Promise<{ success: boolean; message: string; purchaseId: string }>;
	sellBtc(
		walletId: string,
		amountBtc: number,
		amountFiat: number
	): Promise<{ success: boolean; message: string; purchaseId: string }>;
	cancel(
		walletId: string,
		orderId: string
	): { success: boolean; message: string };
}

interface WalletModel extends mongoose.Model<IWallet> {
	findBySeedPhrase(seedPhrase: string): Promise<IWallet | null>;
	buyBtc(
		walletId: string,
		amountBtc: number,
		amountFiat: number
	): { success: boolean; message: string; purchaseId: string };
	sellBtc(
		walletId: string,
		amountBtc: number,
		amountFiat: number
	): { success: boolean; message: string; purchaseId: string };
	deposit(
		walletId: string,
		amount: number
	): { success: boolean; message: string };
	diff(walletId: string): { netProfit: number; percentProfit: number };
	place(
		walletId: string,
		orderId: ObjectId,
		amount: number,
		limit: number,
		type: string
	): { success: boolean; message: string };
	cancel(
		walletId: string,
		orderId: string,
		refund: boolean
	): { success: boolean; message: string };
}

const WalletSchema = new Schema({
	seedPhrase: { type: String, required: true, unique: true },
	seedPhraseFingerprint: { type: String, required: false, index: true },
	balanceFiat: {
		type: Number,
		required: true,
		default: 0,
		min: [0, 'Balance cannot go below zero.'],
		set: (v: number) => Math.round(v * 1e2) / 1e2,
	},
	purchaseFiat: { type: Array, required: false },
	balanceBtc: {
		type: Number,
		required: true,
		default: 0,
		min: [0, 'Balance cannot go below zero.'],
		set: (v: number) => Math.round(v * 1e8) / 1e8,
	},
	totalFiat: {
		type: Number,
		required: true,
		default: 0,
		min: [0, 'Balance cannot go below zero.'],
		set: (v: number) => Math.round(v * 1e2) / 1e2,
	},
	openOrders: { type: Array, required: false },
	orderHistory: { type: Array, required: false },
	depositHistory: { type: Array, required: false },
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
		seedPhraseFingerprint: fingerprint,
	});

	for (const wallet of potentialWallets) {
		const isMatch = await wallet.compareSeedPhrase(hash);
		if (isMatch) {
			return wallet;
		}
	}
	return null;
};

WalletSchema.statics.deposit = async function (
	walletId: string,
	amount: number
) {
	if (amount < 0) {
		console.error(`deposit error: Negative amount attempted: ${amount}`);
		return {
			success: false,
			message: 'Amount cannot be negative.',
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`deposit error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	const date = new Date();
	const depositId = new ObjectId();

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceFiat:
					Math.round((wallet.balanceFiat + amount) * 1e2) / 1e2,
				totalFiat: Math.round((wallet.totalFiat + amount) * 1e2) / 1e2,
			},
			$push: { depositHistory: [depositId, amount, date] },
		},
		{ new: true, runValidators: true }
	);

	if (!updatedWallet) {
		console.error(
			`deposit error: Wallet with ID ${walletId} not found or update failed.`
		);
		return { success: false, message: `Failed to update wallet balance.` };
	}

	return {
		success: true,
		message: `Successfully increased USD by ${Number(
			amount
		).toLocaleString()}. New balance is ${Number(
			updatedWallet.balanceFiat
		).toLocaleString()}.`,
	};
};

WalletSchema.statics.buyBtc = async function (
	walletId: string,
	amountBtc: number,
	amountFiat: number
) {
	if (amountBtc < 0) {
		console.error(`buyBtc error: Negative amount attempted: ${amountBtc}`);
		return {
			success: false,
			message: 'Amount cannot be negative.',
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`buyBtc error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	const date = new Date();
	const purchaseId = new ObjectId();

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceBtc:
					Math.round((wallet.balanceBtc + amountBtc) * 1e8) / 1e8,
				balanceFiat:
					Math.round((wallet.balanceFiat - amountFiat) * 1e2) / 1e2,
			},
			$push: {
				orderHistory: [purchaseId, date, amountBtc, amountFiat, 'buy'],
			},
		},
		{ new: true, runValidators: true }
	);

	if (!updatedWallet) {
		console.error(
			`buyBtc error: Wallet with ID ${walletId} not found or update failed.`
		);
		return { success: false, message: `Failed to update wallet balance.` };
	}

	return {
		success: true,
		message: `Successfully bought ${Number(
			amountBtc
		).toLocaleString()} BTC for ${Number(
			amountFiat
		).toLocaleString()} USD. New balance is ${Number(
			updatedWallet.balanceFiat
		).toLocaleString()} USD / ${Number(
			updatedWallet.balanceBtc
		).toLocaleString()} BTC.`,
		purchaseId,
	};
};

WalletSchema.statics.sellBtc = async function (
	walletId: string,
	amountBtc: number,
	amountFiat: number
) {
	if (amountBtc < 0) {
		console.error(`sellBtc error: Negative amount attempted: ${amountBtc}`);
		return {
			success: false,
			message: 'Amount cannot be negative.',
		};
	}

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(`sellBtc error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	if (wallet.balanceBtc < amountBtc) {
		console.error(
			`sellBtc error: Insufficient balance. Wallet ID: ${walletId}, Current Balance: ${Number(
				wallet.balanceBtc
			).toLocaleString()}, Requested: -${Number(
				amountBtc
			).toLocaleString()}`
		);
		return { success: false, message: `Insufficient balance.` };
	}

	const date = new Date();
	const purchaseId = new ObjectId();

	const updatedWallet = await this.findByIdAndUpdate(
		walletId,
		{
			$set: {
				balanceBtc:
					Math.round((wallet.balanceBtc - amountBtc) * 1e8) / 1e8,
				balanceFiat:
					Math.round((wallet.balanceFiat + amountFiat) * 1e2) / 1e2,
			},
			$push: {
				orderHistory: [purchaseId, date, amountBtc, amountFiat, 'sell'],
			},
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
		message: `Successfully sold ${Number(
			amountBtc
		).toLocaleString()} BTC for ${Number(
			amountFiat
		).toLocaleString()} USD. New balance is ${Number(
			updatedWallet.balanceFiat
		).toLocaleString()} USD / ${Number(
			updatedWallet.balanceBtc
		).toLocaleString()} BTC.`,
		purchaseId,
	};
};

WalletSchema.statics.diff = async function (walletId: string) {
	const wallet = await this.findById(walletId);
	const timestamp = Date.now() / 1000;
	const data = await Ohlc.findByTimestamp(timestamp);

	let btc = 0;
	let fiat = 0;

	for (const [, , amount, , type] of wallet.openOrders || []) {
		if (type === 'buy') {
			fiat += amount;
		} else if (type === 'sell') {
			btc += amount;
		}
	}

	const btcValue =
		Math.round((data?.close || 0) * (wallet.balanceBtc + btc) * 1e2) / 1e2;
	const totalValue = btcValue + wallet.balanceFiat + fiat;

	const netProfit = totalValue - wallet.totalFiat || 0;
	const percentProfit = (netProfit / wallet.totalFiat) * 100 || 0;

	return {
		netProfit: Math.round(netProfit * 1e2) / 1e2,
		percentProfit: Math.round(percentProfit * 1e2) / 1e2,
	};
};

WalletSchema.statics.place = async function (
	walletId: string,
	orderId: ObjectId,
	amount: number,
	limit: number,
	type: string
) {
	const date = new Date();

	const wallet = await this.findById(walletId);

	if (!wallet) {
		console.error(
			`place order error: Wallet with ID ${walletId} not found.`
		);
		return { success: false, message: `Wallet does not exist.` };
	}

	let updatedWallet;

	if (type === 'buy') {
		updatedWallet = await this.findByIdAndUpdate(walletId, {
			$push: { openOrders: [orderId, date, amount, limit, type] },
			$set: {
				balanceFiat:
					Math.round((wallet.balanceFiat - amount) * 1e2) / 1e2,
			},
		});
	} else if (type === 'sell') {
		updatedWallet = await this.findByIdAndUpdate(walletId, {
			$push: { openOrders: [orderId, date, amount, limit, type] },
			$set: {
				balanceBtc:
					Math.round((wallet.balanceBtc - amount) * 1e8) / 1e8,
			},
		});
	}

	if (!updatedWallet) {
		console.error(
			`place error: Wallet with ID ${walletId} not found or update failed.`
		);
		return { success: false, message: `Failed to update wallet order.` };
	}

	return {
		success: true,
		message: `Limit buy order placed: $${Number(
			amount
		).toLocaleString()} at BTC = $${Number(
			limit
		).toLocaleString()} (Order ID: ${Number(orderId).toLocaleString()})`,
	};
};

WalletSchema.statics.cancel = async function (
	walletId: string,
	orderId: string,
	refund: boolean
) {
	const wallet = await this.findById(walletId);
	if (!wallet) {
		console.error(`cancel error: Wallet with ID ${walletId} not found.`);
		return { success: false, message: `Wallet does not exist.` };
	}

	const orderToCancel = (wallet.openOrders || []).find(
		(order: [string, Date, number, number, string]) =>
			order[0]?.toString() === orderId.toString()
	);

	const filteredOrders = (wallet.openOrders || []).filter(
		(order: [string, Date, number, number, string]) =>
			order[0]?.toString() !== orderId.toString()
	);

	wallet.openOrders = filteredOrders;

	if (orderToCancel && refund) {
		const amount = orderToCancel[2] || 0;
		if (orderToCancel[4] === 'buy') {
			wallet.balanceFiat =
				Math.round((wallet.balanceFiat + amount) * 1e2) / 1e2;
		} else if (orderToCancel[4] === 'sell') {
			wallet.balanceBtc =
				Math.round((wallet.balanceBtc + amount) * 1e8) / 1e8;
		}
	}

	await wallet.save();
	console.log(wallet.openOrders);

	return {
		success: true,
		message:
			`Order ${orderId} removed from openOrders.` +
			(orderToCancel ? ` Refunded $${orderToCancel[2]} to balance.` : ''),
	};
};

const Wallet =
	(mongoose.models.Wallet as WalletModel) ||
	mongoose.model<IWallet, WalletModel>('Wallet', WalletSchema);

export default Wallet;
