import { useEffect, useState } from 'react';

export function useIsMdOrLower() {
	const [isMdOrLower, setIsMdOrLower] = useState(false);

	useEffect(() => {
		const check = () =>
			setIsMdOrLower(window.matchMedia('(max-width: 768px)').matches);
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, []);

	return isMdOrLower;
}
