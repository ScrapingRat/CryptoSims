'use client';

import { createContext, useState, useRef, useContext, useEffect } from 'react';
import apiClient from 'lib/apiClient';

type BtcContextType = {
	amount: number | string;
	setAmount: React.Dispatch<React.SetStateAction<number | ''>>;
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
	op: string;
	setOp: (op: string) => void;
	error: string;
	setError: (error: string) => void;
	message: string;
	setMessage: (message: string) => void;
	BtcInputRef: React.RefObject<HTMLInputElement | null>;
	TargetInputRef: React.RefObject<HTMLInputElement | null>;
	order: string;
	setOrder: (order: string) => void;
	target: number | string;
	setTarget: React.Dispatch<React.SetStateAction<number | ''>>;
	isEditingTarget: boolean;
	setIsEditingTarget: (isEditingTarget: boolean) => void;
	setTargetToCurrentPrice: () => void;
};

const BtcContext = createContext<BtcContextType | undefined>(undefined);

export const BtcProvider = ({ children }: { children: React.ReactNode }) => {
	const [amount, setAmount] = useState<number | ''>(0);
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const BtcInputRef = useRef<HTMLInputElement>(null);
	const TargetInputRef = useRef<HTMLInputElement>(null);
	const [order, setOrder] = useState('market');
	const [target, setTarget] = useState<number | ''>(0);
	const [isEditingTarget, setIsEditingTarget] = useState(false);
	const [op, setOp] = useState('');

	const setTargetToCurrentPrice = async () => {
		const data = await apiClient('api/btc/value', 'GET');
		const price = await data.data;

		setTarget(typeof price === 'number' ? price : 0);
		//ERROR HANDLING?
	};

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
		<BtcContext.Provider
			value={{
				amount,
				setAmount,
				isEditing,
				setIsEditing,
				op,
				setOp,
				error,
				setError,
				message,
				setMessage,
				BtcInputRef,
				TargetInputRef,
				order,
				setOrder,
				target,
				setTarget,
				isEditingTarget,
				setIsEditingTarget,
				setTargetToCurrentPrice
			}}>
			{children}
		</BtcContext.Provider>
	);
};

export const useBtc = () => {
	const context = useContext(BtcContext);
	if (context === undefined) {
		throw new Error('useBtc must be used within a BtcProvider');
	}
	return context;
};
