const Wallet = () => {
	return (
		<>
			<h1 className="text-3xl font-bold content-center text-center">
				Wallet
			</h1>
			<div className="w-full max-w-md">
				<form id="wallet-form" className="space-y-6">
					<div>
						<label
							htmlFor="seed"
							className="block text-sm font-medium text-gray-300 mb-2">
							Enter your seed phrase or create a new wallet
						</label>
						<textarea
							id="seed"
							className="w-full p-3 border border-accent2 rounded-lg bg-background text-white focus:ring-2 focus:ring-accent2 focus:outline-none"
							rows={3}
							placeholder="Enter your 12-word seed phrase..."
						/>
						<p id="error" className="mt-2 text-sm text-red-500"></p>
						<p className="mt-2 text-sm text-gray-400">
							Your seed phrase is the 12-word recovery phrase that
							unlocks your wallet. Keep it safe and never share it
							with anyone.
						</p>
					</div>
					<div className="flex gap-4">
						<button
							type="submit"
							className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors">
							Unlock Wallet
						</button>
					</div>
				</form>
			</div>
		</>
	);
};

export default Wallet;
