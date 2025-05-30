import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import apiClient from 'lib/apiClient';
import '../globals.css';

// Import core
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { CandlestickChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// Register components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  CandlestickChart,
  CanvasRenderer
]);

const ReactECharts = dynamic(() => import('echarts-for-react/lib/core'), { ssr: false });

export interface IOhlc {
	t: number;
	o: number;
	h: number;
	l: number;
	c: number;
	v: number;
}

type CandleTuple = [number, number, number, number];

const ranges = [
	{ label: '30 mins', value: 30 * 60, interval: 60 },
	{ label: '24 hours', value: 24 * 60 * 60, interval: 300 },
	{ label: '7 days', value: 7 * 24 * 60 * 60, interval: 1800 },
	{ label: '1 month', value: 30 * 24 * 60 * 60, interval: 10800 },
	{ label: '1 year', value: 365 * 24 * 60 * 60, interval: 86400 },
	{ label: 'All time', value: null, interval: 1296000 }
];

const FIRST_OHLC_TIMESTAMP = 1325412060;

interface CacheEntry {
	candles: CandleTuple[];
	xAxisData: string[];
	timestamp: number;
	range: number | null;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const Graph = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [data, setData] = useState<CandleTuple[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRange, setSelectedRange] = useState<number | null>(
		ranges[0].value
	);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [option, setOption] = useState<any>({
		title: {
			show:
				typeof window !== 'undefined'
					? window.innerWidth < 600
						? false
						: true
					: true,
			text: 'BTC/USD',
			left: 'left',
			textStyle: {
				color: '#fff'
			}
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
			backgroundColor: '#333',
			textStyle: { color: '#fff' }
		},
		xAxis: {
			show: false,
			type: 'category',
			data: [],
			scale: true,
			boundaryGap: false,
			axisLine: { onZero: false, lineStyle: { color: '#888' } },
			splitLine: { show: false },
			min: 'dataMin',
			max: 'dataMax',
			axisLabel: {
				show:
					typeof window !== 'undefined'
						? window.innerWidth < 600
							? false
							: true
						: true,
				color: '#ccc'
			}
		},
		yAxis: {
			scale: true,
			splitArea: {
				show: true,
				areaStyle: { color: ['#111', '#0a0a0a'] }
			},
			axisLabel: {
				inside:
					typeof window !== 'undefined'
						? window.innerWidth < 600
							? true
							: false
						: false,
				margin:
					typeof window !== 'undefined'
						? window.innerWidth < 600
							? 0
							: 10
						: 10,
				overflow: 'break',
				color: '#ededed'
			},
			axisLine: { lineStyle: { color: '#888' } },
			splitLine: { lineStyle: { color: '#333' } }
		},
		grid: {
			left:
				typeof window !== 'undefined'
					? window.innerWidth < 600
						? 0
						: '10%'
					: '10%',
			right:
				typeof window !== 'undefined'
					? window.innerWidth < 600
						? 12
						: '10%'
					: '10%',
			bottom:
				typeof window !== 'undefined'
					? window.innerWidth < 600
						? 40
						: '15%'
					: '15%',
			top:
				typeof window !== 'undefined'
					? window.innerWidth < 600
						? 24
						: 60
					: 60
		},
		dataZoom: [
			{ type: 'inside', start: 0, end: 100 },
			{
				show: true,
				type: 'slider',
				bottom: 0,
				start: 0,
				end: 100,
				backgroundColor: '#0a0a0a',
				dataBackground: {
					lineStyle: { color: '#444' },
					areaStyle: { color: '#0a0a0a' }
				},
				moveHandleStyle: { color: '#fafafa' },
				fillerColor: { color: '#ff0000' },
				handleStyle: { color: '#4ade80' },
				textStyle: { color: '#ededed' }
			}
		],
		series: [
			{
				type: 'candlestick',
				name: 'BTC/USD',
				data: [],
				itemStyle: {
					color: '#4ade80',
					color0: '#ef4444',
					borderColor: '#4ade80',
					borderColor0: '#ef4444'
				}
			}
		],
		backgroundColor: '#0a0a0a'
	});

	type EChartsOption = typeof option;

	useEffect(() => {
		let cancelled = false;
		const fetchData = async () => {
			setLoading(true);
			const end = Math.floor(Date.now() / 1000);

			const rangeObj =
				ranges.find((r) => r.value === selectedRange) ||
				ranges[ranges.length - 1];

			// Check cache first
			const cacheKey = `${selectedRange}`;
			const cachedData = cache[cacheKey];
			const now = Date.now();

			if (
				cachedData &&
				now - cachedData.timestamp < CACHE_DURATION &&
				cachedData.range === selectedRange
			) {
				if (!cancelled) {
					setData(cachedData.candles);
					setOption((prev: EChartsOption) => ({
						...prev,
						xAxis: { ...prev.xAxis, data: cachedData.xAxisData },
						series: [{ ...prev.series[0], data: cachedData.candles }]
					}));
					setLoading(false);
				}
				return;
			}

			let start: number;
			let interval: number;

			if (rangeObj.value) {
				start = end - rangeObj.value;
				interval = rangeObj.interval;
			} else {
				start = FIRST_OHLC_TIMESTAMP;
				interval = rangeObj.interval;
			}

			const { data } = await apiClient<IOhlc[]>('/api/btc/value', 'GET', {
				params: {
					from: start.toString(),
					to: end.toString(),
					interval: interval.toString()
				},
				auth: false
			});
			let candles: CandleTuple[] = [];
			let xAxisData: string[] = [];
			if (data) {
				candles = data.map((d) => [d.o, d.c, d.l, d.h]);
				xAxisData = data.map((d) =>
					new Date(d.t * 1000).toLocaleString()
				);

				// Update cache
				cache[cacheKey] = {
					candles,
					xAxisData,
					timestamp: now,
					range: selectedRange
				};
			}
			if (!cancelled) {
				setData(candles);
				setOption((prev: EChartsOption) => ({
					...prev,
					xAxis: { ...prev.xAxis, data: xAxisData },
					series: [{ ...prev.series[0], data: candles }]
				}));
				setLoading(false);
			}
		};
		fetchData();
		return () => {
			cancelled = true;
		};
	}, [selectedRange]);

	useEffect(() => {
		const handleResize = () => {
			setOption((prev: EChartsOption) => ({
				...prev,
				title: {
					...prev.title,
					show: window.innerWidth < 600 ? false : true
				},
				xAxis: {
					...prev.xAxis,
					show: window.innerWidth < 600 ? false : true,
					axisLabel: {
						...prev.xAxis.axisLabel,
						show: window.innerWidth < 600 ? false : true
					}
				},
				yAxis: {
					...prev.yAxis,
					axisLabel: {
						...prev.yAxis.axisLabel,
						inside: window.innerWidth < 600 ? true : false,
						margin: window.innerWidth < 600 ? 0 : 10
					}
				},
				grid: {
					...prev.grid,
					left: window.innerWidth < 600 ? 0 : '10%',
					right: window.innerWidth < 600 ? 12 : '10%',
					bottom: window.innerWidth < 600 ? 40 : '15%',
					top: window.innerWidth < 600 ? 24 : 60
				}
			}));
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className="w-full mx-auto p-6 border border-accent2 rounded-lg bg-background/50">
			<div className="flex gap-2 mb-4 flex-wrap">
				{ranges.map((r) => (
					<button
						key={r.label}
						className={`px-3 py-1 rounded border text-xs hover:bg-accent1 ${
							selectedRange === r.value
								? 'bg-accent2 text-white'
								: 'bg-background border-accent2 text-accent2'
						}`}
						style={{ flex: '1 0 100px', minWidth: 0 }}
						onClick={() => setSelectedRange(r.value)}>
						{r.label}
					</button>
				))}
			</div>
			{loading && (
				<div className="text-center text-xs text-gray-400">
					Loading data…
				</div>
			)}
			<ReactECharts
				echarts={echarts}
				option={option}
				style={{ height: 400, width: '100%' }}
				notMerge={true}
				lazyUpdate={true}
			/>
		</div>
	);
};

export default Graph;
