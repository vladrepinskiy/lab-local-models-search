# Local Search Lab

A browser-based laboratory for comparing different search implementations (keyword, vector, and LLM-based) using an in-browser PostgreSQL database

## Tech Stack

- **React 19** + **TypeScript**
- **Vite**
- **PGlite** - PostgreSQL in WebAssembly (runs entirely in browser)
- **@xenova/transformers** - In-browser embeddings generation
- **@mlc-ai/web-llm** - In-browser LLM inference (Llama 3.2 3B)
- **Goober** - CSS-in-JS styling

## Setup

```bash
bun install
```

Generate the dataset (includes pre-computing embeddings):

```bash
bun run generate-dataset
```

```bash
bun run dev
```

## Features

- **Keyword Search**: PostgreSQL full-text search
- **Vector Search**: Semantic similarity search using embeddings
- **LLM Search**: Query expansion with typo correction using in-browser LLM
- **Interactive SQL REPL**: Run queries directly in the browser

All search methods run in parallel, and results are displayed side-by-side for comparison
