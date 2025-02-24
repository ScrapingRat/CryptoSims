// pages/api/auto-connect.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '../../lib/mongodb';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await connect();
	res.status(200).json({ message: 'Connected without middleware' });
}
