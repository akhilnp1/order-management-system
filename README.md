# Real-Time Order Management Dashboard

A full-stack order management system with JWT authentication, a PostgreSQL-backed
FastAPI API, a Next.js dashboard, live currency conversion, and real-time order
updates over WebSockets.

## Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Backend    | Python, FastAPI, SQLAlchemy (async), Alembic     |
| Database   | PostgreSQL                                       |
| Frontend   | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Realtime   | Native WebSockets (FastAPI + browser WebSocket API) |
| External API | [Frankfurter](https://www.frankfurter.app/) currency conversion (free, no API key) |
| Auth       | Mock login + JWT (HS256)                         |

## Project Structure

```
order-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, WebSocket endpoint
│   │   ├── config.py            # Settings via environment variables
│   │   ├── database.py          # Async SQLAlchemy engine/session
│   │   ├── models.py            # Order ORM model
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth.py              # JWT creation/validation
│   │   ├── external_api.py      # Currency conversion integration
│   │   ├── websocket_manager.py # Connection manager for broadcasts
│   │   └── routers/
│   │       ├── auth.py          # POST /api/auth/login
│   │       └── orders.py        # Order CRUD + status updates
│   ├── alembic/                 # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── orders/page.tsx
│   ├── components/              # StatusBadge, StatCard, OrderForm, Navbar...
│   ├── lib/                     # api.ts, auth.ts, useOrdersSocket.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md
```

## Quick Start (Docker — recommended)

Requires Docker and Docker Compose.

```bash
git clone <your-repo-url>
cd order-management-system
docker compose up --build
```

This starts three containers:

- **db** — PostgreSQL on `localhost:5432`
- **backend** — FastAPI on `localhost:8000` (migrations run automatically on startup)
- **frontend** — Next.js on `localhost:3000`

Open **http://localhost:3000** and log in with the demo credentials below.

## Demo Credentials

```
Username: admin
Password: admin123
```

(Configurable via `MOCK_USERNAME` / `MOCK_PASSWORD` in `backend/.env`.)

## Manual Setup (without Docker)

### 1. Database

Install PostgreSQL locally and create a database:

```bash
createdb orders_db
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env if your Postgres credentials differ from the defaults

alembic upgrade head             # run migrations
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`.
Swagger docs: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The dashboard is now live at `http://localhost:3000`.

## API Overview

| Method | Endpoint                       | Description                     | Auth |
|--------|--------------------------------|----------------------------------|------|
| POST   | `/api/auth/login`              | Mock login, returns JWT          | No   |
| GET    | `/api/orders`                  | List orders (search/filter/paginate) | Yes |
| GET    | `/api/orders/summary`          | Total + status breakdown         | Yes  |
| GET    | `/api/orders/{id}`             | Order detail                     | Yes  |
| POST   | `/api/orders`                  | Create order                     | Yes  |
| PATCH  | `/api/orders/{id}/status`      | Update order status              | Yes  |
| GET    | `/api/health`                  | Health check                     | No   |
| WS     | `/ws/orders`                   | Real-time order event stream     | No*  |

*The WebSocket endpoint is unauthenticated for simplicity in this assessment;
see `ARCHITECTURE.md` for how this would be hardened in production.

All protected endpoints require `Authorization: Bearer <token>`.

## Real-Time Updates

Whenever an order is created or its status changes, the backend broadcasts a
JSON event to every connected WebSocket client:

```json
{
  "event": "order_status_updated",
  "order": { "id": 1, "customer_name": "John", "status": "Processing", "...": "..." },
  "previous_status": "Pending"
}
```

The frontend's `useOrdersSocket` hook listens for these events and refreshes
the Orders table and Dashboard stats instantly — no page refresh or polling
needed. The connection also auto-reconnects if it drops.

## External API Integration

Order amounts are entered in INR. On creation, the backend calls the
[Frankfurter](https://www.frankfurter.app/) exchange-rate API to convert the
amount to USD and stores it alongside the order (`amount_usd`). If the
external API is unreachable, the order is still created — `amount_usd` is
simply left `null` and the failure is logged, so the feature degrades
gracefully instead of blocking order creation.

## Environment Variables

**backend/.env**

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Async Postgres connection string | `postgresql+asyncpg://postgres:postgres@db:5432/orders_db` |
| `SYNC_DATABASE_URL` | Sync connection string (used by Alembic) | `postgresql+psycopg2://postgres:postgres@db:5432/orders_db` |
| `JWT_SECRET_KEY` | Secret used to sign JWTs | *(change in production)* |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `60` |
| `MOCK_USERNAME` / `MOCK_PASSWORD` | Demo login credentials | `admin` / `admin123` |
| `EXTERNAL_API_URL` | Currency conversion API base URL | `https://api.frankfurter.app/latest` |

**frontend/.env.local**

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend REST API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL | `ws://localhost:8000/ws/orders` |

## Logging

The backend logs to stdout with timestamps, log levels, and module names —
login attempts, order creation/status changes, and external API failures are
all logged. In Docker, view logs with `docker compose logs -f backend`.

## Database Migrations

Migrations are managed with Alembic. To create a new migration after changing
`app/models.py`:

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## Notes on Scope

This project intentionally keeps a few things simple, appropriate for a
timeboxed technical assessment (see `ARCHITECTURE.md` for the reasoning and
what would change for production):

- Authentication is a single hardcoded mock user rather than a full user
  system with signup/roles.
- The WebSocket channel is open (not JWT-gated) to keep the real-time demo
  simple.
- No automated test suite is included (marked optional in the assessment
  brief), though the code is structured to make adding `pytest` /
  `@testing-library/react` tests straightforward.
