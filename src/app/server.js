// const express = require('express');
// const WebSocket = require('ws');

// const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@trade';

// const app = express();
// let price = null;

// // Connect to Binance WebSocket once and keep listening
// const ws = new WebSocket(BINANCE_WS_URL);

// ws.on('message', (data) => {
// 	try {
// 		const parsed = JSON.parse(data);
// 		if (parsed.p) {
// 			price = parseFloat(parsed.p);
// 		}
// 	} catch (err) {
// 		console.error('Failed to parse WS message:', err);
// 	}
// });

// ws.on('error', (err) => {
// 	console.error('WebSocket error:', err);
// });

// app.get('/', (req, res) => {
// 	if (price !== null) {
// 		const formattedPrice = price.toFixed(2);
// 		res.json({ formattedPrice });
// 	} else {
// 		res.status(503).json({ error: 'Price not available yet' });
// 	}
// });

// const PORT = 3001;
// app.listen(PORT, () => {
// 	console.log(`Server listening on port ${PORT}`);
// });
