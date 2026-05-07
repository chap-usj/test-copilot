# REST API CRUD with PostgreSQL (Node.js)

## Setup

```bash
npm install
```

Set database connection variables as needed:

- `PGHOST` (default: `localhost`)
- `PGPORT` (default: `5432`)
- `PGUSER` (default: `postgres`)
- `PGPASSWORD` (optional; set when your PostgreSQL instance requires password authentication)
- `PGDATABASE` (default: `postgres`)
- `TRUST_PROXY` (set to `true` if running behind a reverse proxy so IP-based rate limiting uses forwarded client IPs)
- `RATE_LIMIT_WINDOW_MS` (default: `60000`)
- `RATE_LIMIT_MAX_REQUESTS` (default: `100`)

## Run

```bash
npm start
```

## API

- `GET /items` - List all items
- `GET /items/:id` - Get one item by ID
- `POST /items` - Create item (`{ "name": "...", "description": "..." }`)
- `PUT /items/:id` - Update item (`{ "name": "...", "description": "..." }`)
- `DELETE /items/:id` - Delete item
