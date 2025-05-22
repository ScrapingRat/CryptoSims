import { DepositProvider, useDeposit } from 'app/contexts/DepositContext';
import DepositBtn from './DepositBtn';
import DepositAmount from './DepositAmount';
import DepositSubmitMessage from './DepositSubmitMessage';
import { AnimatePresence, motion } from 'framer-motion';

const DepositContent = () => {
	const { isDepositing } = useDeposit();

	return (
		<>
			<AnimatePresence mode="wait">
				{isDepositing === false ? (
					<motion.div
						key="deposit-btn"
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 0 }}
						transition={{
							duration: 0.25,
							type: 'tween',
							ease: 'easeInOut'
						}}>
						<DepositBtn />
					</motion.div>
				) : (
					<motion.div
						key="deposit-form"
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 0 }}
						transition={{
							duration: 0.25,
							type: 'tween',
							ease: 'easeInOut'
						}}>
						<DepositAmount />
					</motion.div>
				)}
			</AnimatePresence>
			<DepositSubmitMessage />
		</>
	);
};

const Deposit = () => (
	<DepositProvider>
		<DepositContent />
	</DepositProvider>
);

export default Deposit;
