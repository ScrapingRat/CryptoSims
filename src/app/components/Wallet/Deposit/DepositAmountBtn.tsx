import { useDeposit } from 'app/contexts/DepositContext';

const DepositAmountBtn = () => {
	const { setIsEditing, inputRef, amount } = useDeposit();

	return (
		<div>
			<label
				htmlFor="depositSlider"
				className="text-gray-400 block text-center mb-0 cursor-pointer hover:text-yellow-300 bg-accent1 hover:bg-gray-900 rounded-lg py-3 px-4"
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
				Deposit amount: {amount} USD
			</label>
		</div>
	);
};

export default DepositAmountBtn;
