# Encrypt Service

## How to start the service

### Prerequisites

- Node.js 20.11 or later
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

The service reads its configuration from `.env` and will not start without it. Create it from the template, which already holds a demo RSA key pair:

```bash
cp .env.example .env
```

`.env` must contain:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `3000`) | Port the HTTP server listens on |
| `PRIVATE_KEY` | Yes | RSA private key (PEM) |
| `PUBLIC_KEY` | Yes | RSA public key (PEM), from the same pair |

### 3. Start the service

Development (reloads on file changes):

```bash
npm run start:dev
```

Production:

```bash
npm run build
npm run start:prod
```

The service listens on `http://localhost:3000` by default. Set `PORT` in `.env` to change it.
