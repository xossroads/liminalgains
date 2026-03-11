# LIMINAL GAINS

> The threshold state of fitness progress — the in-between space where daily effort accumulates before results become visible.

A mobile-first daily nutrition and weight tracking app. No gamification, no celebration confetti. Just clean data and the quiet satisfaction of showing up.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Setup

Create a `.env` file in the project root:

```
JWT_SECRET=your-secret-here
```

Generate a secret with `openssl rand -hex 32`. This value must stay consistent across restarts or all sessions will be invalidated.

## Running

```bash
docker-compose up --build
```

Open [http://localhost:41972](http://localhost:41972).

- Frontend: port 41972 (only exposed port)
- Backend and PostgreSQL are internal to the Docker network
- Data is persisted in `./data/postgres/`

## Authentication

Invite-only. No public registration. Create users via the backend container:

```bash
docker-compose exec backend node src/create-user.js <username> <password>
```

JWT sessions last 90 days. All API routes (except health and login) require authentication.

## Offline Behavior

The app works fully offline using IndexedDB as a local cache:

- All reads return local data immediately, then background-sync with the server
- All writes go to IndexedDB first, then sync to the API when online
- A sync status indicator in the header shows connectivity state
- Pending changes sync automatically every 30 seconds, on app focus, and when the browser comes back online
- Conflict resolution: last-write-wins, server version takes precedence on 409

## Data Reset

To wipe all data and start fresh:

```bash
docker-compose down
rm -rf ./data/postgres
docker-compose up --build
```

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, IndexedDB (via idb), Axios, lucide-react
- **Backend:** Node.js, Express, node-postgres
- **Database:** PostgreSQL 16
- **Deployment:** Docker Compose, nginx
