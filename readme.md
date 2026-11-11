# Remember

A flashcard study application for creating, organizing, and quizzing yourself on decks of question-and-answer cards. Track your study progress with time-based charts and view analytics on your most-reviewed cards.

## Tech Stack

**Backend:**
- TypeScript + Express
- TypeORM + PostgreSQL
- Inversify (Dependency Injection)
- Zod (Request Validation)
- JWT Authentication (bcrypt + SHA-256)

**Frontend:**
- React + Redux + Redux-Thunk
- D3.js (Progress Charts & Pie Charts)
- XLSX (Client-side Excel parsing)
- Axios (API Client)

## Features

- **Decks (Master Cards)** - Create study decks with a title. Upload cards via Excel/CSV or add them one at a time. Duplicate deck titles per user are prevented.
- **Flashcards (Sub Cards)** - Each card has a question, answer, and optional reference link. Flip cards to reveal answers. Cards track view counts.
- **Folders** - Organize decks into folders. Click a folder to see its decks, edit which decks belong, rename, or delete. Removing a deck from a folder does not delete the deck.
- **Quiz Mode** - Quiz yourself on all cards in a folder with multiple-choice questions generated from other cards in the same folder.
- **Search** - Server-side search across deck titles and card questions with debounced input.
- **Pagination** - Server-side pagination for both decks and cards with configurable page sizes (5, 10, 20, 50).
- **Card Size Control** - Adjustable grid layout for sub cards (S/M/L/XL). Persisted in localStorage.
- **Shuffle** - Server-side random ordering of cards (`ORDER BY RANDOM()`), toggled per session.
- **Reset Cards** - Flip all cards back to the question side with one click.
- **Pie Chart** - Most viewed sub cards displayed in a pie chart, independent of pagination.
- **Study Timer** - Time spent studying each deck is recorded and displayed in a progress chart.
- **Browse & Share** - Share decks publicly (up to 5 per user). Browse and copy other users' public decks.
- **Excel/CSV Upload** - Column A = question, Column B = answer, Column C = link (optional). Duplicate questions in the same deck are updated (answer + link) instead of rejected. Duplicate questions within a single upload batch are deduplicated (last row wins).
- **File Preview** - When creating a new deck from a spreadsheet, cards are parsed client-side and displayed for review before creation. Individual cards can be removed from the preview.
- **Reference Links** - Sub cards can include an optional URL that opens in a new tab from the card back.
- **Responsive Design** - Dark theme with mobile-friendly layout. Cards collapse to single column on small screens.

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

## Deploying

To host it for free (Render for the app, Neon for Postgres), see [DEPLOY.md](DEPLOY.md).

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
      entities/               # TypeORM entities (User, MasterCard, SubCard, Folder, etc.)
      controllers/            # Route controllers (Auth, Profile, MasterCard, SubCard, Pool, Folder)
      services/               # Business logic (Auth, MasterCard, SubCard, Pool, Folder)
      middleware/              # Auth (JWT) and HTTP error handling
      __tests__/              # Jest test suites
  client/
    src/
      components/
        App.js                # Root component with routing
        Main/                 # Home page with progress chart
        Mine/                 # Study & Browse pages with master card grid
        SmallCards/            # Sub card view with pagination, search, pie chart
        Folders/              # Folder list and folder detail views
        Quiz/                 # Quiz mode
        Helper/               # Shared components (forms, cards, buttons)
        CardSizeControl.js    # Grid size slider (S/M/L/XL)
        Header.js             # Side navigation with user menu
        Breadcrumb.js         # Breadcrumb navigation
      actions/                # Redux action creators
      reducer/                # Redux reducers
      utils/                  # Auth helpers, API client, toast notifications
      style/                  # CSS
```

## API Endpoints

### Auth
- `POST /auth/signup` - Register (username + passwordDigest)
- `POST /auth/login` - Login (username + passwordDigest)
- `GET /auth/logout` - Logout

### Profile
- `GET /api/profile` - Get user profile with top viewed cards
- `DELETE /api/profile/deactivate` - Deactivate account and delete all data

### Master Cards
- `GET /api/profile/MasterCard` - List user's decks (supports `?page=&pageSize=&search=`)
- `POST /api/profile/MasterCard` - Create deck with sub cards (including optional links)
- `POST /api/profile/MasterCard/upload` - Create decks from Excel/CSV file
- `GET /api/profile/MasterCard/:uuid` - Get deck with sub cards and progress
- `PUT /api/profile/MasterCard/:uuid` - Update deck title
- `DELETE /api/profile/MasterCard/:uuid` - Delete deck

### Sub Cards
- `GET /api/profile/MasterCard/:uuid/subcards` - List cards (supports `?page=&pageSize=&search=&shuffle=true`)
- `GET /api/profile/MasterCard/:uuid/subcards/top-viewed` - Top viewed cards for pie chart
- `POST /api/profile/MasterCard/:uuid/subcards` - Add single card (question, answer, link)
- `POST /api/profile/MasterCard/:uuid/subcards/upload` - Bulk upload from Excel/CSV (upserts duplicates)
- `PUT /api/profile/MasterCard/subcards/:uuid` - Update card
- `PUT /api/profile/MasterCard/subcards/:uuid/view` - Increment view count
- `DELETE /api/profile/MasterCard/subcards/:uuid` - Delete card
- `PUT /api/profile/MasterCard/time/:uuid` - Record study time

### Pool Cards (Public)
- `GET /api/poolcards` - Get all public decks
- `POST /api/poolcards` - Share a deck publicly (max 5 per user)
- `DELETE /api/poolcards/:uuid` - Remove from public pool
- `POST /api/poolcards/add/:uuid` - Copy a public deck to your collection

### Folders
- `GET /api/folders` - List all folders
- `POST /api/folders` - Create folder
- `GET /api/folders/:uuid` - Get folder with its decks
- `PUT /api/folders/:uuid` - Rename folder
- `DELETE /api/folders/:uuid` - Delete folder (keeps decks)
- `GET /api/folders/decks` - List all user decks (for folder picker)
- `PUT /api/folders/:uuid/decks` - Set folder's decks
- `DELETE /api/folders/:uuid/decks/:deckUuid` - Remove a single deck from folder
- `GET /api/folders/:uuid/quiz` - Get quiz cards (supports `?count=&decks=`)

All authenticated endpoints require `Authorization: Bearer <token>` header.
