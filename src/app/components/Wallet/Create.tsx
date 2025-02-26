const Create = () => {
	return (
		<>
			<div className="flex gap-4">
				<button
					onClick={() => {
						fetch('/api/create', {
							method: 'POST',
						})
							.then((response) => response.json())
							.then((data) => {
								console.log(data.seedPhrase, data.balance);
							})
							.catch((error) => {
								console.error('Error creating wallet:', error);
							});
					}}
					type="button"
					className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors">
					Create wallet
				</button>
			</div>
		</>
	);
};

export default Create;
