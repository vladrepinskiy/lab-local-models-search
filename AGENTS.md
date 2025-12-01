# Local Search Lab - Agent Context

> **Purpose**: A browser-based laboratory for comparing different search implementations (keyword, vector, and LLM-based) using an in-browser PostgreSQL database.

## 🎯 High-Level Purpose

This is an educational/experimental application that allows users to:

- Seed a local database with fake documents
- Compare search results across different search methods simultaneously
- Run SQL queries directly in the browser via an embedded REPL
- Understand performance characteristics of different search approaches

**Key Innovation**: Everything runs client-side in the browser using WebAssembly (PGlite).

## 📦 Tech Stack

### Core

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite (using rolldown-vite 7.2.5)
- **Package Manager**: Bun
- **Styling**: Goober (CSS-in-JS, ~1KB)
- **Database**: PGlite 0.3.14 (PostgreSQL in WebAssembly)

### Key Dependencies

- `@electric-sql/pglite` - In-browser PostgreSQL database
- `@electric-sql/pglite-repl` - Interactive SQL console component
- `@faker-js/faker` - Generate realistic fake data for seeding
- `goober` - Lightweight CSS-in-JS
- `babel-plugin-react-compiler` - Automatic React optimizations

### Dev Tools

- TypeScript 5.9.3
- ESLint 9.39.1
- Prettier 3.7.3

## 🏗️ Architecture

### Directory Structure

```
src/
├── components/           # React components
│   ├── core/            # Reusable core components (Button, etc.)
│   ├── AppShell.tsx     # Main layout wrapper
│   ├── HeaderBar.tsx    # Top header with search + DB controls
│   ├── Panel.tsx        # Search results panel
│   ├── ResultsList.tsx  # Results display
│   ├── MetricsBar.tsx   # Performance metrics
│   └── DBRepl.tsx       # PGlite REPL toggle
├── context/             # React Context providers
│   ├── db.provider.tsx       # Database state & operations
│   └── search.provider.tsx   # Search state & operations
├── hooks/               # Custom React hooks
│   ├── useDatabase.ts   # Access DB context
│   └── useSearch.ts     # Access search context
├── db/                  # Database logic
│   ├── db.ts           # PGlite initialization & helpers
│   └── seed.ts         # Seed/clear operations
├── search/              # Search implementations
│   ├── keywordSearch.ts    # PostgreSQL full-text search (implemented)
│   ├── vectorSearch.ts     # Embedding-based search (stub)
│   └── llmSearch.ts        # LLM-powered search (stub)
├── constants/           # Constant values
│   ├── schema.constant.ts  # SQL DDL statements
│   └── queries.constant.ts # SQL query strings
└── types/               # TypeScript types
    └── search.types.ts  # Shared type definitions
```

### State Management

**Architecture**: React Context API with custom hooks

- `DBProvider` → manages database state, seeding, clearing
- `SearchProvider` → manages query state and search execution
- Custom hooks (`useDatabase`, `useSearch`) provide clean access

**No prop drilling** - all state accessed via hooks.

### Search Architecture

**Current Implementation**:

- **Keyword Search**: PostgreSQL GIN full-text search (working)
- **Vector Search**: Placeholder for embedding-based similarity search
- **LLM Search**: Placeholder for LLM-powered semantic search

All three searches run **in parallel** when the user clicks "Search All".

## 🎨 Design Decisions

### Code Style

1. **const arrow functions everywhere** - No `function` keyword

   ```typescript
   // ✅ Correct
   export const MyComponent = () => { ... }
   const myFunction = () => { ... }

   // ❌ Avoid
   export function MyComponent() { ... }
   function myFunction() { ... }
   ```

2. **No useCallback/useMemo** - React Compiler handles optimizations automatically
   - We rely on `babel-plugin-react-compiler` for automatic memoization
   - Cleaner, more maintainable code

3. **Naming Conventions**:
   - Providers: `*.provider.tsx` (e.g., `db.provider.tsx`)
   - Types: `*.types.ts` (e.g., `search.types.ts`)
   - Constants: `*.constant.ts` (e.g., `schema.constant.ts`)

4. **TypeScript imports**:
   - Use `import type` for type-only imports
   - Enables proper tree-shaking and cleaner separation

### UI/UX Decisions

1. **Minimalistic Design**:
   - No bright gradients or flashy colors
   - Black (#1a1a1a) and white color scheme
   - Subtle borders instead of heavy shadows
   - Clean, flat aesthetic

2. **Layout**:
   - **3-column grid** showing all search results simultaneously
   - **Full-height panels** utilizing all available viewport space
   - **Compact header** with integrated search bar (saves vertical space)
   - **Collapsible REPL** at bottom (500px when expanded)

3. **Consistent Components**:
   - All buttons are **40px height** for consistency
   - Core components (Button) live in `components/core/`
   - Reusable, type-safe components

### Database Decisions

1. **PGlite** (PostgreSQL in WASM):
   - Runs entirely in browser (no server needed)
   - Persistent storage using browser APIs
   - Full PostgreSQL feature set (triggers, full-text search, etc.)

2. **Schema**:
   - Single `documents` table with title, content, metadata
   - GIN index for full-text search
   - JSONB metadata field for flexible data
   - Ready for vector extensions (pgvector) in future

3. **Seeding**:
   - Default: 1000 fake documents via faker
   - Batch inserts (100 at a time) for performance
   - Can clear and re-seed on demand

## 🚀 Infrastructure

### Development

```bash
bun install        # Install dependencies
bun run dev        # Start dev server (port 5173)
bun run build      # Build for production
bun run preview    # Preview production build
```

### Deployment

**GitHub Actions** (`.github/workflows/deploy.yml`):

- Triggers on push to `main` branch
- Builds the app using Bun
- Deploys to `deploy` branch
- User configures GitHub Pages to serve from `deploy` branch

**Note**: No `base` path needed since deploying from branch root.

## 🔮 Future Enhancements

### Planned (Stubs Already Exist)

1. **Vector Search**: Integrate embeddings model + pgvector
2. **LLM Search**: Integrate web-llm for client-side LLM inference
3. **Hybrid Search**: Combine keyword + vector for best results

### Potential Additions

- Document upload functionality
- Export search results
- Search history
- Custom scoring algorithms
- Performance benchmarking tools

## 💡 Key Insights

### Why PGlite?

- **No backend needed** - runs entirely in browser
- **Fast** - native WASM performance
- **Familiar** - standard PostgreSQL, not a subset
- **Educational** - great for learning SQL and search techniques

### Why Goober?

- **Tiny** - only 1KB vs styled-components (~16KB)
- **Fast** - minimal runtime overhead
- **Familiar** - same API as styled-components
- **Setup** - just `setup(createElement)`, no provider needed

### Why React Context?

- **Simple** - no external dependencies (Redux, Zustand, etc.)
- **Type-safe** - full TypeScript support
- **Sufficient** - app complexity doesn't warrant heavy state management
- **React Compiler friendly** - automatic optimizations work well

## 🔧 Working With This Codebase

### Adding a New Search Method

1. Create implementation in `src/search/`
2. Add result state to `search.provider.tsx`
3. Add to parallel search execution in `performSearch()`
4. Add panel to grid in `AppShell.tsx`

### Adding a Core Component

1. Create in `src/components/core/`
2. Export from `src/components/core/index.ts`
3. Use consistent height/spacing with existing components

### Modifying Database Schema

1. Update `src/constants/schema.constant.ts`
2. Update types in `src/types/search.types.ts`
3. May need to clear and re-seed database

## 📝 Notes for AI Agents

- This project uses **React 19** with the new React Compiler
- **Don't add** `useCallback` or `useMemo` - the compiler handles it
- **Always** use const arrow functions, not function declarations
- **Respect** the naming conventions (`.provider.tsx`, `.types.ts`, etc.)
- **Keep** the minimalistic design - no gradients, simple colors
- **Maintain** 40px button height consistency
- **Test** with `bun run build` before committing

### ⚠️ IMPORTANT: Keep This Document Updated

**After making ANY changes to the codebase, you MUST:**

1. Review if the changes affect this documentation
2. Update relevant sections (architecture, dependencies, design decisions, etc.)
3. Keep the file accurate and up-to-date
4. Document any new patterns, conventions, or architectural decisions

This ensures future agents (and humans) have accurate information about the project.

## 🎓 Learning Resources

- [PGlite Documentation](https://pglite.dev/)
- [React Compiler](https://react.dev/learn/react-compiler)
- [Goober Documentation](https://goober.js.org/)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
