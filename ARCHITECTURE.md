# Architecture Decisions

## Overview

A three-tier system: Next.js frontend, FastAPI backend, PostgreSQL database,
connected by a REST API for CRUD operations and a WebSocket channel for
real-time order updates.

## Key Decisions

**Async SQLAlchemy over sync ORM calls.** FastAPI is built on async I/O, and
the app both talks to Postgres and calls an external currency API on order
creation. Using `asyncpg` + SQLAlchemy's async session keeps the request loop
non-blocking under concurrent load instead of tying up a worker thread per
request.

**Single WebSocket broadcast channel instead of per-client polling.** A
`ConnectionManager` holds all active WebSocket connections and broadcasts a
JSON event to everyone whenever an order is created or its status changes.
This was simpler and more efficient than having the frontend poll
`GET /api/orders` every few seconds, and it matches the "connected users
receive updates instantly" requirement directly. The manager also prunes
dead connections opportunistically on failed sends.

**JWT with a mock login rather than a full auth system.** The brief allows
mock authentication, so a single configured username/password issues a
signed JWT (HS256, 60-minute expiry) rather than building out a users table,
password hashing, refresh tokens, etc. All order endpoints depend on a
`get_current_user` dependency that validates the token, so swapping in real
user accounts later only touches `auth.py` and the login route — the rest of
the app is unaffected.

**Currency conversion fails open, not closed.** Order creation calls the
Frankfurter API to populate `amount_usd`. If that call times out or errors,
the order is still created with `amount_usd = null` rather than the whole
request failing — a third-party outage shouldn't block core order
functionality. The failure is logged for visibility.

**Structured API responses.** Mutating endpoints (`POST /orders`,
`PATCH /orders/{id}/status`) return a consistent `{ success, message, data }`
envelope, and global exception handlers normalize error responses the same
way, so the frontend has one shape to handle regardless of endpoint.

**Indexes on `status` and `created_at`.** These are the two columns the UI
filters and sorts by (status filter, default newest-first ordering), so
they're indexed; `customer_name` search uses `ILIKE`, which is acceptable at
this scale but would move to a trigram or full-text index if the dataset grew
large.

**Optimistic UI updates + WebSocket reconciliation.** Changing an order's
status updates local state immediately for a responsive feel, while the
WebSocket broadcast (which every client, including the sender, receives)
re-syncs state shortly after — so a slow network doesn't leave the UI stuck
mid-update, but the user doesn't wait for a round trip to see feedback either.

## What I'd Change for Production

- Gate the WebSocket handshake behind the JWT (pass the token as a query
  param or subprotocol and validate before accepting the connection).
- Replace the single mock user with a real `users` table, hashed passwords,
  and refresh tokens.
- Add rate limiting on `/api/auth/login`.
- Move `ILIKE` search to a proper full-text/trigram index if the orders table
  grows large.
- Add a test suite (`pytest` + `httpx.AsyncClient` for the API,
  `@testing-library/react` for components) — omitted here since it's marked
  optional in the brief and the priority was a working end-to-end system.
