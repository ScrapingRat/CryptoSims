const CancelOrderMessage = ({
	error,
	message
}: {
	error: string;
	message: string;
}) => {
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

export default CancelOrderMessage;
