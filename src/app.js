const express = require("express");
const { pool } = require("./db");

const app = express();
app.set("trust proxy", process.env.TRUST_PROXY === "true");
app.use(express.json());

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);
const requestWindows = new Map();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, value] of requestWindows.entries()) {
    if (now - value.windowStart >= RATE_LIMIT_WINDOW_MS) {
      requestWindows.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);
cleanupTimer.unref();

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeDescription(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() === "" ? null : value;
}

function isValidName(value) {
  return typeof value === "string" && value.trim() !== "";
}

app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const entry = requestWindows.get(key);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    requestWindows.set(key, { count: 1, windowStart: now });
    return next();
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests" });
  }

  return next();
});

app.get("/items", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, created_at FROM items ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/items/:id", async (req, res, next) => {
  try {
    const itemId = parseId(req.params.id);
    if (!itemId) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const result = await pool.query(
      "SELECT id, name, description, created_at FROM items WHERE id = $1",
      [itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.post("/items", async (req, res, next) => {
  try {
    const { name } = req.body || {};
    const description = normalizeDescription(req.body?.description);
    if (!isValidName(name)) {
      return res.status(400).json({ error: "name is required" });
    }

    const result = await pool.query(
      "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at",
      [name, description]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.put("/items/:id", async (req, res, next) => {
  try {
    const itemId = parseId(req.params.id);
    if (!itemId) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const { name } = req.body || {};
    const description = normalizeDescription(req.body?.description);
    if (!isValidName(name)) {
      return res.status(400).json({ error: "name is required" });
    }

    const result = await pool.query(
      "UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, created_at",
      [name, description, itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.delete("/items/:id", async (req, res, next) => {
  try {
    const itemId = parseId(req.params.id);
    if (!itemId) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING id",
      [itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (res.headersSent) {
    return _next(error);
  }

  console.error("Unhandled error:", error);
  return res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
