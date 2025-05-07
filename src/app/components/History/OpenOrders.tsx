import { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import OpenOrdersTableHead from './OpenOrdersTableHead';
import OpenOrdersTableBody from './OpenOrdersTableBody';
import CancelOrderMessage from './CancelOrderMessage';

const OpenOrders = () => {
	const { isUnlocked, openOrders, fetchWallet } = useWallet();
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked, fetchWallet]);

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
		<>
			{(openOrders ?? []).length !== 0 && (
				<div className="flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
					<h2 className="text-l font-bold mb-4 text-center">
						Open Orders
					</h2>
					<div className="overflow-y-auto max-h-32 overflow-x-auto whitespace-nowrap rounded-lg md:flex md:justify-center">
						<table
							className="w-full text-left sm:text-center"
							aria-label="Open Orders">
							<OpenOrdersTableHead />
							<OpenOrdersTableBody
								setError={setError}
								setMessage={setMessage}
							/>
						</table>
					</div>
					<CancelOrderMessage error={error} message={message} />
				</div>
			)}
		</>
	);
};

export default OpenOrders;
