# MAM Tours

A responsive MAM Tours discovery homepage for browsing destinations and sample tour packages. It presents destination inspiration, sample journeys, destination, season and travel-style filters, saved-trip controls and a newsletter sign-up interaction.

## Run locally

Requirements: Node.js and PHP 8.2 or later.

```bash
npm ci
npm run build
php -S 127.0.0.1:8000 -t dist
```

Then open http://127.0.0.1:8000.

The page is a static front-end prototype. Trip names, routes, prices, availability labels and travel-story copy are sample display content, not live offers or verified reviews. Search filters the sample journeys in the browser; newsletter sign-up and saved journeys show local confirmation only. There is no booking, account, payment, customer database, or email integration connected yet.

## Deploy to Railway

The repository builds the Vite page into `dist/` and serves that directory with PHP's built-in web server. Railway deploys automatically from the connected branch using `nixpacks.toml`.

## Project status

The previous repository snapshot described a Laravel car-rental system, but the Laravel application source directories were not present. The current deployable product is the MAM Tours static homepage. Reintroduce Laravel only when its application source and backend requirements are restored.
