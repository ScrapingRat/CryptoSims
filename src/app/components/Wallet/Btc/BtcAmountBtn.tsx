import { useBtc } from 'app/contexts/BtcContext';

const BtcAmountBtn = () => {
	const { amount, op, setIsEditing, BtcInputRef: inputRef } = useBtc();

	return (
		<div>
			<label
				className="text-gray-400 block text-center hover:text-yellow-300 bg-accent1 rounded-lg py-3 px-4 hover:bg-gray-900"
				onClick={() => {
					setIsEditing(true);
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						setIsEditing(true);
						setTimeout(() => {
							inputRef.current?.focus();
						}, 0);
						e.preventDefault();
					}
				}}
				tabIndex={0}>
				{op === 'buy' ? 'Buy' : 'Sell'} amount:{' '}
				{Number(amount).toLocaleString()} {op === 'buy' ? 'USD' : 'BTC'}
			</label>
		</div>
	);
};

export default BtcAmountBtn;
