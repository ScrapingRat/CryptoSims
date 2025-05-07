import { useBtc } from 'app/contexts/BtcContext';

const BtcLimitInput = () => {
	const {
		TargetInputRef: inputRef,
		target,
		setTarget,
		setIsEditingTarget,
		setTargetToCurrentPrice
	} = useBtc();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value =
			e.target.value === ''
				? ''
				: Math.max(
						0,
						Math.min(
							200000,
							Number(Number(e.target.value).toFixed(2))
						)
				  );
		setTarget(value);
	};

	return (
		<input
			ref={inputRef}
			type="number"
			aria-label="Target price"
			value={target}
			onChange={handleChange}
			onBlur={() => {
				setIsEditingTarget(false);
				if (target === '') {
					setTargetToCurrentPrice();
				}
			}}
			className="font-medium flex-1 py-3 px-4 text-center text-gray-400 block w-full rounded-lg bg-gray-900"
			min={0}
			max={200000}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					setIsEditingTarget(false);
					if (target === '') {
						setTargetToCurrentPrice();
					}
					e.preventDefault();
				}
			}}
		/>
	);
};

export default BtcLimitInput;
