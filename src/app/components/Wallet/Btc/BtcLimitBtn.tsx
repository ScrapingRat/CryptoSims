import { useBtc } from 'app/contexts/BtcContext';

const BtcLimitBtn = () => {
	const { TargetInputRef: inputRef, target, setIsEditingTarget } = useBtc();

	return (
		<label
			className="py-3 px-4 w-full bg-accent1 text-gray-400 block hover:text-yellow-300 text-center mb-2 cursor-pointer transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900"
			onClick={() => {
				setIsEditingTarget(true);
				setTimeout(() => {
					inputRef.current?.focus();
				}, 0);
			}}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					setIsEditingTarget(false);
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
					e.preventDefault();
				}
			}}
			tabIndex={0}>
			Target price: {target} USD
		</label>
	);
};

export default BtcLimitBtn;
