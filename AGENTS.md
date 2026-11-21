# AGENTS.md

## Stack

- Node.js application using Express 4 and `body-parser` for JSON request bodies.
- Browser UI uses HTML, CSS, and client-side JavaScript served from `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.
- Package version: `0.8.4`.

## Module map

- `server.js`: configures Express, serves the UI, mounts API routers, and serves printable order invoices.
- `config.js`: port, shop details, tax slabs, inventory defaults, and coupon definitions.
- `routes/products.js`: product list and active coupons.
- `routes/orders.js`: order listing, lookup, placement, and cancellation.
- `routes/customers.js`: customer/settlement listing and settlement recording.
- `routes/reports.js`: dashboard, GST reconciliation, pricing preview, and admin export.
- `lib/store.js`: reads and writes `data/db.json` and appends audit entries.
- `lib/orders.js`: order creation, lookup, listing, and cancellation.
- `lib/inventory.js`: product lookup, stock checks, inventory updates, and inventory summary.
- `lib/pricing.js`, `lib/coupons.js`, `lib/tax.js`: totals, coupon validation/discounts, and GST calculations.
- `lib/ledger.js`: customer balances, khata charges/reversals, and settlements.
- `lib/reports.js`: dashboard summary and GST reconciliation.
- `lib/invoice.js`: invoice calculations and HTML rendering.
- `lib/dates.js`: date formatting, normalization, and fiscal year helper.
- `public/`: browser UI (`index.html`, `js/app.js`, `css/style.css`).
- `data/db.json`: products, orders, customers, settlements, audit log, and ID counters.

## Commands

- `npm start` — runs `node server.js` and starts the HTTP server.
- `node server.js` — starts the HTTP server directly.
- `npm test` — currently a placeholder that exits with an error; no test suite is configured.

## Working rules

- Write characterization tests before changing behaviour.
- Change only the module the ticket is about.
- Tests must never touch `data/db.json`.
- Add no dependencies.
