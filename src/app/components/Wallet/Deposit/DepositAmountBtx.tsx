const DepositAmountBtn = ({
	setIsEditingAmount,
	depositInputRef,
	depositAmount
}: {
	setIsEditingAmount: (isEditing: boolean) => void;
	depositInputRef: React.RefObject<HTMLInputElement | null>;
	depositAmount: number | string;
}) => {
	return (
		<>
			<div>
				<label
					htmlFor="depositSlider"
					className="text-gray-400 block text-center mb-0 cursor-pointer hover:text-yellow-300 bg-accent1 hover:bg-gray-900 rounded-lg py-3 px-4"
					onClick={() => {
						setIsEditingAmount(true);
						setTimeout(() => {
							depositInputRef.current?.focus();
						}, 0);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							setIsEditingAmount(true);
							setTimeout(() => {
								depositInputRef.current?.focus();
							}, 0);
							e.preventDefault();
						}
					}}
					tabIndex={0}>
					Deposit amount: {depositAmount} USD
				</label>
			</div>
		</>
	);
};

export default DepositAmountBtn;
