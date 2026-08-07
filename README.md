# DSA Hub — Backend

A lightweight Node.js + Express backend for managing users, coding patterns, and practice questions for a DSA (Data Structures & Algorithms) study hub. Provides JWT-based authentication, role middleware, and PostgreSQL-backed persistence with database migrations.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- User registration and authentication (bcrypt + JWT)
- Role-based middleware (admin checks)
- CRUD operations for patterns and questions
- Centralized error handling middleware
- PostgreSQL persistence with node-pg-migrate migrations

## Tech Stack
- Language: JavaScript (ES Modules)
- Runtime / Framework: Node.js + Express 5
- Database: PostgreSQL (node `pg`)
- Notable libraries:
  - express, dotenv, cors, cookie-parser
  - jsonwebtoken, bcryptjs
  - node-pg-migrate (DB migrations)

## Quickstart

1. Clone the repo and install dependencies:
```bash
git clone https://github.com/pavan-reddy-kudumula/dsa-hub.git
cd dsa-hub/Backend
npm install
```

2. Create an environment file (.env) at Backend/.env and set the required environment variables (see below).

3. Run migrations (example):
```bash
npm run migrate:up
```

4. Start the server in development:
```bash
npm run dev
# or for production
npm start
```

Default entrypoint: `src/server.js`

Scripts available (from package.json):
- `npm run dev` — nodemon `src/server.js`
- `npm start` — `node src/server.js`
- `npm run migrate:create` — create a new migration (node-pg-migrate)
- `npm run migrate:up` — run migrations (up)
- `npm run migrate:down` — rollback migrations (down)

## Environment variables
Create `Backend/.env` and set at least:
- PORT — port to run the server (e.g. 3000)
- DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT — PostgreSQL connection
- JWT_SECRET — secret for signing JWTs
- (Any other config keys referenced in `Backend/src/config/*`)

## Database & Migrations
Migrations are managed with `node-pg-migrate`. Migration files live in `Backend/migrations/`. Use the npm scripts to create and run migrations:

- Create a migration:
```bash
npm run migrate:create -- name=create_my_table
```
- Apply migrations:
```bash
npm run migrate:up
```
- Rollback:
```bash
npm run migrate:down
```

## API overview
Routes are implemented under `Backend/src/routes/`. Key route files:
- `auth.route.js` — authentication endpoints (login, register, token-related)
- `user.route.js` — user management endpoints
- `pattern.route.js` — CRUD for patterns
- `question.route.js` — CRUD for practice questions

Controllers are in `Backend/src/controllers/`:
- `auth.controller.js`, `user.controller.js`, `pattern.controller.js`, `question.controller.js`

Middleware:
- `auth.middleware.js` — authentication check
- `admin.middleware.js` — admin role enforcement
- `errorHandler.middleware.js` — centralized error responses

Look into those route and controller files for exact endpoint paths, request/response shapes, and validations.

## Project structure
```
Backend/
  package.json                # Node project + scripts
  package-lock.json
  migrations/                 # node-pg-migrate migration files
  src/
    server.js                 # Express app entrypoint
    config/                   # app configuration (env parsing, DB config)
    constants/                # app-wide constants
    controllers/              # request handlers (auth, user, pattern, question)
      auth.controller.js
      user.controller.js
      pattern.controller.js
      question.controller.js
    routes/                   # express routers mounted by server.js
      auth.route.js
      user.route.js
      pattern.route.js
      question.route.js
    middleware/               # auth, admin, error handling
      auth.middleware.js
      admin.middleware.js
      errorHandler.middleware.js
    lib/
      utils.js                # small utilities/helpers
```

How it fits together:
- `src/server.js` boots the Express app, applies middleware (CORS, cookies, JSON), mounts routers from `src/routes/*`, and starts the HTTP server.
- Routes delegate to controllers which perform validation, business logic, and persistence via PostgreSQL. Middlewares enforce auth and admin privileges and centralize error handling.

## Contributing
- Open an issue or PR for bug fixes or feature requests.
- Follow the existing code style (ES modules).
- If you add DB changes, include a migration in `Backend/migrations/` and add corresponding up/down SQL or JS migration steps.

## Notes / TODOs
- Add a top-level README or documentation for the frontend (if any).
- Add tests and CI workflow.
- Add detailed environment/config documentation (exact env keys used by `src/config`).

## License
Licensed under ISC (see `Backend/package.json`).
