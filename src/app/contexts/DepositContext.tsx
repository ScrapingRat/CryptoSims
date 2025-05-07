'use client';

import {
	createContext,
	useState,
	useRef,
	useContext,
	useEffect
} from 'react';

type DepositContextType = {
	amount: number | string;
	setAmount: React.Dispatch<React.SetStateAction<number | ''>>;
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
	error: string;
	setError: (error: string) => void;
	message: string;
	setMessage: (message: string) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
	isDepositing: boolean;
	setIsDepositing: (isDepositing: boolean) => void;
};

const DepositContext = createContext<DepositContextType | undefined>(undefined);

export const DepositProvider = ({ children }: { children: React.ReactNode }) => {
	const [amount, setAmount] = useState<number | ''>(0);
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDepositing, setIsDepositing] = useState(false);

	useEffect(() => {
		if (error || message) {
			const timer = setTimeout(() => {
				setError('');
				setMessage('');
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [error, message]);

	useEffect(() => {
		const handleClickOutside = () => {
			setError('');
			setMessage('');
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	return (
		<DepositContext.Provider
			value={{
				amount,
				setAmount,
				isEditing,
				setIsEditing,
				error,
				setError,
				message,
				setMessage,
				inputRef,
				isDepositing,
				setIsDepositing,
			}}>
			{children}
		</DepositContext.Provider>
	);
};

export const useDeposit = () => {
	const context = useContext(DepositContext);
	if (context === undefined) {
		throw new Error('useDeposit must be used within a DepositProvider');
	}
	return context;
};
