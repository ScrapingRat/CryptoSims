import Order from '../models/order';

export async function listOrders() {
	try {
		return Order.find({});
	} catch (error) {
		console.error('Error listing open orders:', error);
		return [];
	}
}
