import isAuth from "lib/actions/isAuth";

export const checkAuth = async (): Promise<boolean> => {
	try {
		return await isAuth();
	} catch (error) {
		console.error('Authentication check failed:', error);
		return false;
	}
};
