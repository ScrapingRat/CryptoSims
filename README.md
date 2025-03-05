
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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