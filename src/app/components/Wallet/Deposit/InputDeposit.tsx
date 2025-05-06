import { ChangeEvent } from "react";

const InputDeposit = ({
	depositInputRef,
	depositAmount,
	handleAmountChange,
	setDepositAmount,
	setIsEditingAmount
}: {
	depositInputRef: React.RefObject<HTMLInputElement | null>;
	depositAmount: number | string;
	handleAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
	setDepositAmount: React.Dispatch<React.SetStateAction<number | ''>>;
	setIsEditingAmount: (isEditing: boolean) => void;

}) => {
	return (
		<>
			<input
				ref={depositInputRef}
				type="number"
				aria-label="Deposit amount"
				value={depositAmount}
				onChange={handleAmountChange}
				onBlur={() => {
					if (depositAmount === '') {
						setDepositAmount(0);
					}
					setIsEditingAmount(false);
				}}
				onFocus={() => {
					if (depositAmount === 0) setDepositAmount('');
				}}
				className="font-medium flex-1 py-3 px-4 text-center text-gray-400 block w-full rounded-lg bg-gray-900"
				min={0}
				max={50000}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						setIsEditingAmount(false);
						if (depositAmount === '') {
							setDepositAmount(0);
						}
						e.preventDefault();
					}
				}}
			/>
		</>
	);
};

export default InputDeposit;
