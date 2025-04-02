
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
docker run -d --name mongodb -p 27017:27017 mongo
npm install
NODE_OPTIONS='--inspect' npm run dev

curl -L -o bitcoin-historical-data.zip https://www.kaggle.com/api/v1/datasets/download/mczielinski/bitcoin-historical-data
unzip bitcoin-historical-data.zip
mv *.csv data.csv
curl -X POST http://localhost:3000/api/update -H 'x-api-key: $API_KEY'
curl -X POST http://localhost:3000/api/catchup -H 'x-api-key: $API_KEY'
```

[http://localhost:3000](http://localhost:3000)

## Introduction

Cryptomoneys investments simulation. The goal is to produce a SPA (Single Page Applications) which provides a Candle Graph.

### Candle Graph

- [] Changing the duration range
- [] Changing duration of each candle
- [] Showing basic infos when hovering a candle

### Wallet Simulation

- [] Selecting an initial amount to invest in selected assets
- [] Placing orders (market price, limit, stop-loss, minimum)
- [] Visualization of assets
- [] No registration system needed to save the wallet in the backend (must use a seed and passphrase?)

### API

- [] https://coinmarketcap.com/api/
- [] No API calls from the frontend
- [] Near to real-time data
- [] Taking into account the API limit rate (roughly 1 API call every 5 seconds)

## Tech Stack

<ul>
	<li>NextJS/MongoDB</li>
	<li>Tailwind CSS/HeadlessUI</li>
	<li>100% Typescript</li>
	<li>Pure functions, no class object</li>
	<li>ZodTS for validation/schemas</li>
	<li>No React class component</li>
	<li>Usage of a store is allowed, Zustand is recommended, Redux is interesting but overkill</li>
	<li>ESLint is mandatory</li>
	<li>Prettier is mandatory</li>
	<li>100% tests coverage E2E (Cypress or another)</li>
	<li>No WebSocket/SSE, must use pollers or HTTP longpolling</li>
</ul>

### Bonus

<ul>
	<li>Jest unit tests for the backend</li>
	<li>Wallet history</li>
	<li>Offline handling</li>
	<li>PWA Android/iOS</li>
</ul>

### To do

- [] Keep loading components if DB is not up
- [] Blacklist JWT when locking wallet