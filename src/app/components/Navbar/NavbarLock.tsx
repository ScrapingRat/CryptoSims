import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';

const NavbarLock = () => {
	const { setIsUnlocked } = useWallet();

	const handleLock = async () => {
		try {
			interface Response {
				message: string;
			}
			const { data, error, errorMessage } = await apiClient<Response>(
				'api/lock',
				'DELETE'
			);

			//NEED TO BE ABLE TO LOCK EVEN IF ONLINE BY DELETING THE COOKIES FROM HERE

			if (!error) {
				console.log(data?.message);
				setIsUnlocked(false);
			} else {
				console.log(errorMessage);
			}
		} catch (error) {
			console.error('Failed to lock wallet:', error);
		}
	};

	return (
		<button
			onClick={handleLock}
			type="button"
			className="rounded-lg bg-white hover:bg-accent5 p-1 text-black font-semibold flex items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				className="size-6"
				role="img"
				aria-label="Lock wallet">
				<path
					fillRule="evenodd"
					d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
					clipRule="evenodd"
				/>
			</svg>
		</button>
	);
};

export default NavbarLock;
