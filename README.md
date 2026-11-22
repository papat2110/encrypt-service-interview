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

```bash
cp .env.example .env
```

`.env.example` already contains `PORT` and a demo RSA key pair (`PRIVATE_KEY`, `PUBLIC_KEY`), so the service runs without any changes.

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
