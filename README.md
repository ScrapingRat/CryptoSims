This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
docker run -d --name mongodb -p 27017:27017 mongo
npm install
NODE_OPTIONS='--inspect' npm run dev

curl -L -o bitcoin-historical-data.zip https://www.kaggle.com/api/v1/datasets/download/mczielinski/bitcoin-historical-data && unzip bitcoin-historical-data.zip && mv *.csv data.csv && rm bitcoin-historical-data.zip
curl -X POST http://localhost:3000/api/update -H 'x-api-key: $API_KEY'
curl -X POST http://localhost:3000/api/catchup -H 'x-api-key: $API_KEY'
```

An additional server (express) is used to sideload /src/app/server.js to avoid Binance API limit rate. To avoid over-complicating the startup of nextjs, it runs as a standalone instance. A cron job is used to run /api/catchup and /api/execute.

[http://localhost:3000](http://localhost:3000)

## Introduction

Cryptomoneys investments simulation. The goal is to produce a SPA (Single Page Applications) which provides a Candle Graph.

### Candle Graph

[Apache Echarts](https://echarts.apache.org/en/index.html)

### Wallet Simulation

<ul>
	<li>Selecting an initial amount to invest in selected assets</li>
	<li>Placing orders (market price, limit price)</li>
	<li>Visualization of assets</li>
	<li>No registration system needed to save the wallet in the backend</li>
	<li>Wallet history</li>
</ul>

### API

<ul>
	<li>Binance API</li>
	<li>Near to real-time data</li>
</ul>

## Tech Stack

<ul>
	<li>NextJS/MongoDB</li>
	<li>Tailwind CSS</li>
	<li>100% Typescript</li>
	<li>Pure functions, no class object</li>
	<li>ESLint</li>
	<li>Prettier</li>
	<li>Memory based API rate-limit</li>
</ul>

### WIP

<ul>
	<li>Jest unit tests for the backend</li>
	<li>Offline handling</li>
	<li>PWA Android/iOS</li>
	<li>Blacklist JWT when locking wallet</li>
	<li>100% tests coverage E2E (Cypress or another)</li>
	<li>ZodTS for validation/schemas</li>
	<li>Moving all the authentication in the wallet context</li>
</ul>
