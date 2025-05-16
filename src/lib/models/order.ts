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
		min: [10, 'Cannot order for less than 10'],
		required: true
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
		if (this.limitType === 'buy') {
			if (this.limit < value) {
				return false;
			}

			const amountBtc = (this.amount * 1) / value;
			const i = await Wallet.incBtc(
				this.walletId,
				amountBtc,
				this.amount,
				this.purchaseId
			);
			console.log(i);
			const b = await Wallet.cancel(this.walletId, this._id, false);
			console.log(b);
		}

		// } else if (this.limitType === 'sell') {

		// }
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
