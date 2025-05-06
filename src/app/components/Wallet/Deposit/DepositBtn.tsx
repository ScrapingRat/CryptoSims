const DepositBtn = ({
	setIsDepositing
}: {
	setIsDepositing: (isDepositing: boolean) => void;
}) => {
	return (
		<>
			<div className="mt-3 text-center flex">
				<button
					onClick={() => setIsDepositing(true)}
					type="button"
					className="font-medium flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					Deposit USD
				</button>
			</div>
		</>
	);
};

export default DepositBtn;