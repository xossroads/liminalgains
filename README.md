# LIMINAL GAINS

> The threshold state of fitness progress — the in-between space where daily effort accumulates before results become visible.

A mobile-first daily nutrition and weight tracking app. No gamification, no celebration confetti. Just clean data and the quiet satisfaction of showing up.

**Domain:** liminalgains.fit

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

## Local Development

```bash
docker-compose up --build
```

Open [http://localhost:41972](http://localhost:41972) in your browser.

- Frontend: port 41972 (nginx, only exposed port)
- Backend and PostgreSQL are internal to the Docker network only

## Production Deployment

### 1. DNS Setup

Point `liminalgains.fit` A record to your server's IP address.

### 2. Reverse Proxy with Caddy (HTTPS)

Install [Caddy](https://caddyserver.com/) on your server. Create a `Caddyfile`:

```
liminalgains.fit {
    reverse_proxy localhost:41972
}
```

Run Caddy — it handles SSL/TLS certificates automatically:

```bash
caddy run
```

Then start the app:

```bash
DOMAIN=liminalgains.fit docker-compose up -d --build
```

### Alternative: nginx reverse proxy

```nginx
server {
    listen 443 ssl;
    server_name liminalgains.fit;

    ssl_certificate /etc/letsencrypt/live/liminalgains.fit/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/liminalgains.fit/privkey.pem;

    location / {
        proxy_pass http://localhost:41972;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

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
docker-compose down -v
docker-compose up --build
```

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, IndexedDB (via idb), Axios, lucide-react
- **Backend:** Node.js, Express, node-postgres
- **Database:** PostgreSQL 16
- **Deployment:** Docker Compose, nginx
