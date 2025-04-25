import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
const BINANCE_REST_URL =
	'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';

const BinanceTicker: React.FC = () => {
	const [price, setPrice] = useState<string | null>(null);
	const [lastPrice, setLastPrice] = useState<number | null>(null);
	const [color, setColor] = useState<string>('text-accent2');
	const [change, setChange] = useState<number | null>(null);
	const [changePercent, setChangePercent] = useState<number | null>(null);

	useEffect(() => {
		const fetchChange = async () => {
			try {
				const res = await fetch(BINANCE_REST_URL);
				const data = await res.json();
				setChange(parseFloat(data.priceChange));
				setChangePercent(parseFloat(data.priceChangePercent));
			} catch {
				setChange(null);
				setChangePercent(null);
			}
		};
		fetchChange();
		const interval = setInterval(fetchChange, 60000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const ws: WebSocket | null = new WebSocket(BINANCE_WS_URL);

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.p) {
				const newPrice = parseFloat(data.p);
				setPrice(data.p);

				setColor((prev) => {
					if (lastPrice === null) return 'text-accent2';
					if (newPrice > lastPrice) return 'text-green-500';
					if (newPrice < lastPrice) return 'text-red-500';
					return prev;
				});
				setLastPrice(newPrice);
			}
		};

		ws.onerror = () => {
			ws?.close();
		};

		return () => {
			ws?.close();
		};
	}, [lastPrice]);

	const formattedPrice = price
		? `$${parseFloat(price).toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
		  })}`
		: 'Loading...';

	let changeColor = 'text-accent2';
	if (change !== null) {
		if (change > 0) changeColor = 'text-green-500';
		else if (change < 0) changeColor = 'text-red-500';
	}

	return (
		<div>
			<p className="text-gray-400 text-center">
				<Image
					src="/bitcoin.svg"
					alt="Bitcoin"
					width={22}
					height={22}
					className="inline-block align-top"
					style={{ position: 'relative', top: '1px' }}
					priority
				/>{' '}
				BTC / USD:
			</p>
			<div className="font-bold text-center">
				<p
					className={color}
					style={{
						transition: 'color 0.2s',
						letterSpacing: '0.02em',
						textAlign: 'center'
					}}>
					{formattedPrice}
				</p>
				{change !== null && changePercent !== null && (
					<div className={`${changeColor} text-xs opacity-75`}>
						24h ≃ {change > 0 ? '+' : ''}
						{change.toFixed(2)} ({changePercent > 0 ? '+' : ''}
						{changePercent.toFixed(2)}%)
					</div>
				)}
			</div>
		</div>
	);
};

export default BinanceTicker;
