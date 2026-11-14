# Deployment

This repository currently deploys a static MAM Tours front-end, built by Vite and served from `dist/`.

## Railway

Connect this repository to a Railway service with the Nixpacks builder. The checked-in `nixpacks.toml` installs Node.js and PHP, runs `npm ci`, builds with `npm run build`, and starts PHP's built-in web server on Railway's `PORT`.

No database or payment credentials are required for the current static homepage.

## Local production-style run

```bash
npm ci
npm run build
PORT=8000 php -S 0.0.0.0:$PORT -t dist
```

## Important project scope

The Laravel source referenced by earlier versions of this guide is absent from this repository snapshot. The current front-end is a static prototype; its trip search filters sample cards in the browser and its sign-up form does not send email. Restore and review the backend before enabling real bookings, accounts, payments, or customer-data collection.
