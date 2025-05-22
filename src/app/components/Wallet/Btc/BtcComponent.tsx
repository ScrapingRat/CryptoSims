import { BtcProvider, useBtc } from 'app/contexts/BtcContext';
import BinanceTicker from './binance';
import BtcBtns from './BtcBtns';
import BtcOrderTypeBtns from './BtcOrderTypeBtns';
import BtcAmount from './BtcAmount';
import BtcSubmitMessage from './BtcSubmitMessage';
import { AnimatePresence, motion } from 'framer-motion';

const BtcComponentElement = () => {
	const { op } = useBtc();

	return (
		<div className="flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
			<BinanceTicker />
			<AnimatePresence mode='wait'>
				{op === '' ? (
					<motion.div
						key="btc-btns"
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 0 }}
						transition={{
							duration: 0.25,
							type: 'tween',
							ease: 'easeInOut'
						}}>
						<BtcBtns />
					</motion.div>
				) : (
					<motion.div
						key="btc-form"
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 0 }}
						transition={{
							duration: 0.25,
							type: 'tween',
							ease: 'easeInOut'
						}}>
						<BtcOrderTypeBtns />
						<BtcAmount />
					</motion.div>
				)}
			</AnimatePresence>
			<BtcSubmitMessage />
		</div>
	);
};

const BtcComponent = () => (
	<BtcProvider>
		<BtcComponentElement />
	</BtcProvider>
);

export default BtcComponent;
