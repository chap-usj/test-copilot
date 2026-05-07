# REST API CRUD with PostgreSQL (Node.js)

## Setup

```bash
npm install
```

Set database connection variables as needed:

- `PGHOST` (default: `localhost`)
- `PGPORT` (default: `5432`)
- `PGUSER` (default: `postgres`)
- `PGPASSWORD` (default: `postgres`)
- `PGDATABASE` (default: `postgres`)

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
