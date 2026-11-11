# Remember - Client

React frontend for the Remember flashcard application.

## Setup

```bash
npm install
npm start
```

Runs on http://localhost:3000 and proxies API requests to the backend server.

## Key Components

- **App** - Root component with React Router, top bar with brand icon, breadcrumb navigation
- **Main** - Home page with study progress chart (D3.js bar chart) and top viewed cards
- **Mine** - Study and Browse pages displaying master card grids with server-side pagination and search
- **SmallCards** - Sub card view with flip animations, pie chart, search, shuffle, pagination, and card size control
- **Folders** - Folder management (create, rename, delete) and folder detail view showing associated decks
- **Quiz** - Quiz mode with multiple-choice questions generated from folder contents
- **CreateMaster** - Deck creation with client-side Excel/CSV parsing and card preview
- **CardSizeControl** - Slider to adjust sub card grid columns (S=4, M=3, L=2, XL=1), persisted in localStorage
- **Header** - Side navigation with user avatar, page links (Home, Study, Browse), and system menu (logout, deactivate)

## State Management

Redux with thunk middleware. Key reducers:
- `master_card` - `{ items, total }` shape for paginated master cards
- `showsubcards` - `{ items, total }` shape for paginated sub cards
- `user` - Current user profile
- `poolcards` - Public pool cards
