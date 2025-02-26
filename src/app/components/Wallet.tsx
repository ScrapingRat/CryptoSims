import Create from "./Wallet/Create";
import Unlock from "./Wallet/Unlock";

const Wallet = () => {
	return (
		<>
			<h1 className="text-3xl font-bold content-center text-center">
				Wallet
			</h1>
			<div className="w-full max-w-md mx-auto mt-8 space-y-8">
				<Unlock />
				<Create />
			</div>
		</>
	);
};

export default Wallet;
