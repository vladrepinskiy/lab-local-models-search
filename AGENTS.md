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
- `@xenova/transformers` - In-browser ML models (embeddings generation)
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
├── services/            # Business logic services
│   └── embedding.service.ts  # Transformers.js embedding generation
├── db/                  # Database logic
│   ├── db.ts           # PGlite initialization & helpers
│   └── seed.ts         # Seed/clear operations
├── search/              # Search implementations
│   ├── keywordSearch.ts    # PostgreSQL full-text search (implemented)
│   ├── vectorSearch.ts     # Embedding-based search (implemented)
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

- **Keyword Search**: PostgreSQL GIN full-text search (implemented)
- **Vector Search**: pgvector-based semantic similarity search with Transformers.js embeddings (implemented)
- **LLM Search**: Placeholder for LLM-powered semantic search

All three searches run **in parallel** when the user clicks "Search All".

#### Vector Search Details

**Embedding Model**: `Xenova/all-MiniLM-L6-v2`

- 384-dimensional embeddings
- ~23MB model download (first time only, cached in browser after)
- Runs entirely client-side via ONNX Runtime Web
- Fast inference suitable for real-time search

**Implementation**:

- Embeddings are pre-computed during dataset generation (run `bun run generate-dataset`)
- Combined title + content text is embedded for each document
- Pre-computed embeddings stored in JSON file, loaded during seeding (fast!)
- Search queries are embedded on-the-fly using the same model (in browser)
- pgvector's cosine distance operator (`<=>`) finds similar documents
- HNSW index enables fast approximate nearest neighbor search

**Performance**:

- Dataset generation: ~30-40 minutes for 3,348 documents (one-time, run with `bun run generate-dataset`)
- Database seeding: ~10-30 seconds (embeddings loaded from JSON file)
- Query embedding: ~50-200ms per search (in browser)
- Vector similarity search: <100ms with HNSW index

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
   - Single `documents` table with title, content, metadata, and embedding
   - GIN index for full-text search
   - HNSW index for vector similarity search (cosine distance)
   - JSONB metadata field for flexible data
   - pgvector extension enabled for 384-dimensional embeddings

3. **Seeding**:
   - **3,348 real Wikipedia articles** about art history (from 377 Wikipedia pages)
   - Articles are chunked into ~500-word segments for realistic search scenarios
   - Topics include: art movements, famous artists, techniques, museums, concepts, historical periods, and iconic artworks
   - **Embeddings are pre-computed** during dataset generation (run `bun run generate-dataset`)
   - Embeddings stored in the JSON file, so seeding is fast (~seconds instead of hours)
   - Can clear and re-seed on demand
   - Dataset generated via `scripts/generate-dataset.ts` (includes pre-computed embeddings)

## 🚀 Infrastructure

### Development

```bash
bun install              # Install dependencies
bun run generate-dataset # Generate Wikipedia dataset (run once)
bun run dev              # Start dev server (port 3000)
bun run build            # Build for production
bun run preview          # Preview production build
```

### Deployment

**GitHub Actions** (`.github/workflows/deploy.yml`):

- Triggers on push to `main` branch
- Builds the app using Bun
- Deploys to `deploy` branch
- User configures GitHub Pages to serve from `deploy` branch

**Note**: No `base` path needed since deploying from branch root.

## 🔮 Future Enhancements

### Planned

1. **LLM Search**: Integrate web-llm for client-side LLM inference
2. **Hybrid Search**: Combine keyword + vector for best results
3. **Reranking**: Add cross-encoder reranking for better precision

### Potential Additions

- Document upload functionality
- Export search results
- Search history
- Custom scoring algorithms
- Performance benchmarking tools
- Different embedding models (comparison)
- Query expansion and refinement

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

## 🎨 Dataset Information

### Current Dataset: Art History Wikipedia Articles

**Content**: 3,348 documents from 377 Wikipedia articles covering:

- **Art Movements** (68 topics): Renaissance, Baroque, Impressionism, Cubism, Surrealism, Expressionism, Fauvism, Arte Povera, Fluxus, De Stijl, Street art, etc.
- **Artists** (109 artists): Leonardo da Vinci, Van Gogh, Picasso, Monet, Frida Kahlo, Hilma af Klint, Botticelli, Raphael, Goya, Turner, Kandinsky, Pollock, Rothko, Basquiat, Banksy, Ai Weiwei, etc.
- **Techniques** (73 techniques): Oil painting, Sculpture, Photography, Fresco, Encaustic painting, Mosaic, Stained glass, Tapestry, Video art, Sound art, Daguerreotype, etc.
- **Museums** (46 museums): Louvre, Metropolitan Museum of Art, British Museum, MoMA, Getty Center, Art Institute of Chicago, Musée d'Orsay, Van Gogh Museum, etc.
- **Concepts** (76 concepts): Color theory, Perspective, Chiaroscuro, Aesthetics, Golden ratio, Symmetry, Art market, Outsider art, Sublime, Kitsch, Camp, etc.
- **Historical Periods** (28 periods): Prehistoric art, Ancient Greek art, Byzantine art, Medieval art, Gothic art, Dutch Golden Age, Victorian painting, Islamic art, African art, etc.
- **Iconic Artworks** (40 artworks): Mona Lisa, Sistine Chapel, The Starry Night, Guernica, American Gothic, Nighthawks, Campbell's Soup Cans, etc.

**Chunking Strategy**: Articles are split into ~500-word chunks to simulate real-world document retrieval scenarios where large documents are broken into searchable segments.

**Example Searches to Try**:

- "Impressionism painting" - Find impressionist art content
- "Leonardo da Vinci Renaissance" - Cross-topic search
- "Picasso Cubism" - Artist and movement
- "museum collection" - Find museum-related content
- "color theory composition" - Art concepts
- "Van Gogh sunflowers" - Artist and specific work

### Regenerating the Dataset

```bash
bun run generate-dataset
```

This will fetch fresh content from Wikipedia. The script is configured to:

- Fetch from predefined art topics
- Chunk articles into ~500 words
- Add rate limiting (100ms between requests) to be respectful to Wikipedia
- Save to `src/data/art-history-dataset.json`

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
