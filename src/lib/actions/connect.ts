'use server';
import { connect } from '../mongodb';

export async function connectToDatabase() {
	try {
		await connect();
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
