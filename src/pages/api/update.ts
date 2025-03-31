import { NextApiRequest, NextApiResponse } from 'next';
import update from "@actions/update";
import Ohlc, { IOhlc } from '@models/ohlc';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await update();
	const date = new Date();
	const time = date.getTime();
	const data: IOhlc | null = await Ohlc.findByTimestamp(time);
	return res.status(200).json(data);
};

export default handler;