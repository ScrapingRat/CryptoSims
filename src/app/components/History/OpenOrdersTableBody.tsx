import { useWallet } from 'app/contexts/WalletContext';
import CancelOrder from './CancelOrder';

const OpenOrdersTableBody = ({
	setError,
	setMessage
}: {
	setError: (error: string) => void;
	setMessage: (message: string) => void;
}) => {
	const { openOrders } = useWallet();
	return (
		<tbody>
			{[...(openOrders ?? [])]
				.sort(
					(a, b) =>
						new Date(b[1]).getTime() - new Date(a[1]).getTime()
				)
				.map(([id, date, amount, price, type]) => (
					<tr className="even:bg-hover hover:bg-accent3" key={id}>
						<td className="pl-2 pr-2">
							{new Date(date).toLocaleString()}
						</td>
						<td className="pl-2 pr-2">{amount}</td>
						<td className="pl-2 pr-2">{price}</td>
						<td className="pl-2 pr-2">{type}</td>
						<td
							className="pl-2 pr-2"
							style={{
								height: '26',
								verticalAlign: 'middle'
							}}>
							<CancelOrder
								orderId={id}
								setMessage={setMessage}
								setError={setError}
							/>
						</td>
					</tr>
				))}
		</tbody>
	);
};

export default OpenOrdersTableBody;
