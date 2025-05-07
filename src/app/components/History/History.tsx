import OrderHistory from './OrderHistory';
import OpenOrders from './OpenOrders';

const History = () => {
	return (
		<div className="w-full mx-auto flex flex-col md:flex-row gap-4 sm:gap-6 md:flex-wrap">
			<OrderHistory />
			<OpenOrders />
		</div>
	);
};

export default History;
