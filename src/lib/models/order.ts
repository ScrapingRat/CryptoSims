import mongoose, { Schema, Document } from 'mongoose';
import Wallet from './wallet';
// import { ObjectId } from 'mongodb';

interface IOrder extends Document {
	walletId: string;
	amount: number;
	limit: number;
	limitType: string;
	purchaseId: string;
	isExecutable(value: number): Promise<boolean>;
	execute(value: number): { success: boolean; message: string };
}

interface OrderModel extends mongoose.Model<IOrder> {
	place(
		walletId: string,
		amount: number,
		limit: number,
		limitType: string,
		purchaseId: string
	): { success: boolean; message: string; id: string };
	isExecutable(value: number): Promise<boolean>;
	execute(value: number): { success: boolean; message: string };
}

const OrderSchema = new Schema({
	walletId: { type: String, required: true },
	amount: {
		type: Number,
		required: true,
		validate: {
			validator: function (this: IOrder, value: number) {
				if (this.limitType === 'sell') {
					return value >= 0.000001;
				}
				return value >= 10;
			},
			message: function (this: IOrder) {
				return this.limitType === 'sell'
					? 'Cannot sell less than 0.000001 BTC'
					: 'Cannot order for less than 10 USD';
			}
		}
	},
	limit: {
		type: Number,
		min: [0.01, 'Price cannot be less than 0.01'],
		required: true
	},
	limitType: {
		type: String,
		enum: {
			values: ['buy', 'sell'],
			message: 'Only buy and sell are supported values'
		},
		required: true
	},
	purchaseId: {
		type: String,
		required: true,
		unique: true
	}
});

OrderSchema.methods.isExecutable = async function (value: number) {
	if (this.limitType === 'buy') {
		if (this.limit >= value) {
			return true;
		}
	}
	if (this.limitType === 'sell') {
		if (this.limit <= value) {
			return true;
		}
	}
	return false;
};

OrderSchema.methods.execute = async function (value: number) {
	try {
		const wallet = await Wallet.findById(this.walletId);
		if (!wallet) {
			return {
				success: false,
				message: 'Wallet not found'
			};
		}

		console.log(this);
		if (this.limitType === 'buy') {
			if (this.limit < value) {
				return false;
			}

			const amountBtc =
				Math.round(((this.amount * 1) / value) * 1e8) / 1e8;
			await Wallet.incBtc(
				this.walletId,
				amountBtc,
				this.amount,
				this.purchaseId
			);
		} else if (this.limitType === 'sell') {
			if (this.limit > value) {
				return false;
			}

			// const amountBtc = Math.round(this.amount 1e2) / 1e2;
			// await Wallet.incFiat(
			// 	this.walletId,
			// 	amountBtc,
			// 	this.amount,
			// 	this.purchaseId
			// );
		}
		await Wallet.cancel(this.walletId, this._id, false);
		await this.deleteOne();
		return {
			success: true,
			message: 'Order executed successfully'
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
			id: ''
		};
	}
};

OrderSchema.statics.place = async function (
	walletId: string,
	amount: number,
	limit: number,
	limitType: string,
	purchaseId: string
) {
	try {
		const order = await this.create({
			walletId,
			amount,
			limit,
			limitType,
			purchaseId
		});

		return {
			success: true,
			message: 'Order placed successfully',
			id: order._id.toString()
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
			id: ''
		};
	}
};

const Order =
	(mongoose.models.Order as OrderModel) ||
	mongoose.model<IOrder, OrderModel>('Order', OrderSchema);

export default Order;
