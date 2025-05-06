import HandleDeposit from './HandleDeposit';
import { useWallet } from 'app/contexts/WalletContext';

const SubmitDeposit = ({
	setIsEditingAmount,
	setDepositAmount,
	setIsDepositing,
	setError,
	setMessage,
	amount
}: {
	setIsEditingAmount: (isEditing: boolean) => void;
	setDepositAmount: React.Dispatch<React.SetStateAction<number | ''>>;
	setIsDepositing: (isDepositing: boolean) => void;
	setError: (error: string) => void;
	setMessage: (message: string) => void;
	amount: number | string;
}) => {
	const { fetchWallet, balanceFiat } = useWallet();
	return (
		<>
			<div className="flex justify-center gap-3 mt-3">
				<button
					onClick={() => {
						setIsEditingAmount(false);
						HandleDeposit(
							setError,
							setMessage,
							fetchWallet,
							balanceFiat,
							setIsDepositing,
							amount
						);
						setDepositAmount(0);
					}}
					type="button"
					className="w-full font-medium py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
					Confirm
				</button>
				<button
					onClick={() => {
						setIsDepositing(false);
						setIsEditingAmount(false);
						setDepositAmount(0);
					}}
					type="button"
					className="w-full font-medium py-3 px-4 bg-red-500/75 text-white rounded-lg hover:bg-red-600/75 transition-colors">
					Cancel
				</button>
			</div>
		</>
	);
};

export default SubmitDeposit;
