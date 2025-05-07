import { useBtc } from 'app/contexts/BtcContext';

const BtcSubmitMessage = () => {
	const { error, message } = useBtc();
	return (
		<>
			{error && (
				<p className="text-center mt-2 text-sm text-red-500">{error}</p>
			)}
			{message && (
				<p className="text-center mt-2 text-sm text-green-500">
					{message}
				</p>
			)}
		</>
	);
};

export default BtcSubmitMessage;
