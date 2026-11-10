# Remember

A flashcard application for memorization and time-tracking your study progress.

## Tech Stack

**Backend:**
- TypeScript + Express
- TypeORM + PostgreSQL
- Inversify (Dependency Injection)
- Zod (Request Validation)
- JWT Authentication (bcrypt + SHA-256)

**Frontend:**
- React + Redux + Redux-Thunk
- D3.js (Progress Charts)
- Axios (API Client)

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & docker-compose

### Setup

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm --prefix server install
   npm --prefix client install
   ```

3. **Create `.env`** in the project root (see `.env` for defaults):
   ```
   DATABASE_URL=postgres://remember:password@localhost:5556/remember
   JWT_SECRET=dev-only-secret
   DB_SYNC=true
   PORT=5000
   CLIENT_ORIGIN=http://localhost:3000
   ```

4. **Run development servers:**
   ```bash
   npm run dev
   ```
   - API: http://localhost:5000
   - Client: http://localhost:3000

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and client in dev mode |
| `npm run server` | Start API only (with hot-reload) |
| `npm run client` | Start React client only |
| `npm run db` | Start PostgreSQL container |
| `npm test` | Run server tests |
| `npm run build` | Build both server and client for production |

### Server Scripts (from `server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with tsx watch |
| `npm test` | Run Jest tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:generate -- src/migrations/Name` | Generate migration from entity changes |

## Project Structure

```
remember/
  docker-compose.yml          # PostgreSQL 16
  server/
    src/
      index.ts                # Entry point
      app.ts                  # Express app factory
      config.ts               # Environment configuration
      container.ts            # Inversify DI container
      data-source.ts          # TypeORM DataSource
      types.ts                # DI binding tokens
      constants/              # App constants
      entities/               # TypeORM entities (User, MasterCard, SubCard, etc.)
      controllers/            # Route controllers (Auth, Profile, MasterCard, Pool)
      services/               # Business logic (Auth, MasterCard, SubCard, Pool)
      middleware/              # Auth (JWT) and HTTP error handling
      __tests__/              # Jest test suites
  client/
    src/
      components/             # React components
      actions/                # Redux action creators
      reducer/                # Redux reducers
      utils/                  # Auth helpers, API client
      style/                  # CSS
```

## API Endpoints

### Auth
- `POST /auth/signup` - Register (username + passwordDigest)
- `POST /auth/login` - Login (username + passwordDigest)
- `GET /auth/logout` - Logout

### Profile
- `GET /api/profile` - Get user profile with top 5 cards

### Master Cards
- `GET /api/profile/MasterCard` - Get all user's master cards
- `POST /api/profile/MasterCard` - Create master card with sub cards
- `PUT /api/profile/MasterCard/:uuid` - Update master card
- `DELETE /api/profile/MasterCard/:uuid` - Delete master card
- `PUT /api/profile/MasterCard/time/:uuid` - Record study time
- `GET /api/profile/MasterCard/:uuid` - Get card progress

### Pool Cards (Public)
- `GET /api/poolcards` - Get all public cards
- `POST /api/poolcards` - Share a card publicly
- `DELETE /api/poolcards/:uuid` - Remove from pool
- `POST /api/poolcards/add/:uuid` - Copy pool card to your collection

All authenticated endpoints require `Authorization: Bearer <token>` header.
