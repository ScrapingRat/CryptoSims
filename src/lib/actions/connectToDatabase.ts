'use server';

import { connect } from '../mongodb';

const connectToDatabase = async () => {
	try {
		await connect();
		return { success: true };
	} catch (error) {
		console.error('Failed to connect to database:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};

export default connectToDatabase;
