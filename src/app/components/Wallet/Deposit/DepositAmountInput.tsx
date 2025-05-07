import { useDeposit } from 'app/contexts/DepositContext';

const DepositAmountInput = () => {
	const { amount, setAmount, inputRef, setIsEditing } = useDeposit();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value =
			e.target.value === ''
				? ''
				: Math.max(
						0,
						Math.min(
							50000,
							Number(Number(e.target.value).toFixed(2))
						)
				  );
		setAmount(value);
	};

	return (
		<input
			ref={inputRef}
			type="number"
			aria-label="Deposit amount"
			value={amount}
			onChange={handleChange}
			onBlur={() => {
				if (amount === '') {
					setAmount(0);
				}
				setIsEditing(false);
			}}
			onFocus={() => {
				if (amount === 0) setAmount('');
			}}
			className="font-medium flex-1 py-3 px-4 text-center text-gray-400 block w-full rounded-lg bg-gray-900"
			min={0}
			max={50000}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					setIsEditing(false);
					if (amount === '') {
						setAmount(0);
					}
					e.preventDefault();
				}
			}}
		/>
	);
};

export default DepositAmountInput;
