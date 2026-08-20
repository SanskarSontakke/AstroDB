# AstroDB 🌌
### Production Astronomical Relational Database & AI Agent Knowledge Gateway

AstroDB is a production-grade multi-catalog astronomical database, pgvector semantic search engine, and agentic gateway engineered for autonomous AI agents, researchers, and astronomers.

---

## 🌟 Key Features

- **16 Normalized Relational Tables**: Full schema with referential integrity covering Stars, Star Systems, Exoplanets, Moons, Astrobiology & Habitability, Compact Relics / Gravitational Waves, Galaxies, Deep Sky Objects, Molecular Clouds, Supernova Remnants, and Cross-Catalog Registries.
- **pgvector Semantic Search**: Dense 1536-dimensional OpenAI embeddings for natural language querying across 3,550+ celestial bodies.
- **Model Context Protocol (MCP) Server**: Turnkey MCP server endpoint for Claude Desktop, Cursor, and agent frameworks.
- **OpenAPI 3.0 & Function Calling**: Standardized JSON tool definitions ready for OpenAI Function Calling, LangChain, and LlamaIndex.
- **Safe Read-Only SQL Sandbox**: AI agents can execute dynamic read-only SQL queries with guardrails against mutations.
- **Modern Next.js 14 Web Portal**:
  - **Catalog Explorer**: Faceted search and sorting across all 16 tables.
  - **Object Deep-Dive**: Comprehensive astrophysics dossiers with habitability indexes (ESI, PHI), transit curves, and star relations.
  - **3D Celestial Sky Map**: Real-time celestial sphere projection with interactive coordinate inspection.
  - **AI Playground**: Live tool-calling simulator and testbench.
  - **Developer Hub**: Interactive API documentation, MCP config generators, and SDK snippets.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. (The app automatically runs against the local SQLite database when offline!).

---

## 🛰️ Production Deployment

See the complete step-by-step guide in [DEPLOYMENT_GUIDE.md](file:///C:/Users/SanskarSontakke/AstroDB/DEPLOYMENT_GUIDE.md):

1. **Supabase Database**: Apply [`supabase_schema.sql`](file:///C:/Users/SanskarSontakke/AstroDB/supabase_schema.sql) and seed with [`supabase_seed_data.sql`](file:///C:/Users/SanskarSontakke/AstroDB/supabase_seed_data.sql).
2. **Embeddings Pipeline**: Run `python scripts/generate_embeddings.py`.
3. **Vercel Hosting**: Connect repository to Vercel and add environment variables.

---

## 📁 Repository Structure

```
AstroDB/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── search/          # Hybrid vector + keyword search
│   │   │   │   ├── objects/         # List & deep relational graph [id]
│   │   │   │   ├── systems/         # Star system hierarchies
│   │   │   │   ├── catalogs/        # Specialized sub-catalogs
│   │   │   │   ├── query/           # Guarded read-only SQL runner
│   │   │   │   └── tools/           # Function calling schemas
│   │   │   ├── mcp/                 # Model Context Protocol JSON-RPC
│   │   │   └── openapi.json/        # OpenAPI 3.0 specification
│   │   ├── explorer/                # Astronomical Catalog Explorer UI
│   │   ├── objects/[id]/            # Object Deep Dive Dossier UI
│   │   ├── skymap/                  # 3D Celestial Sky Map UI
│   │   ├── playground/              # AI Agent Playground & Testbench UI
│   │   ├── docs/                    # Developer & Agent Integration Hub UI
│   │   ├── globals.css              # Cosmic theme styling
│   │   ├── layout.tsx               # Root layout & navigation
│   │   └── page.tsx                 # Portal Landing page
│   ├── components/                  # UI Components (Navbar, Footer, etc.)
│   └── lib/
│       ├── supabase.ts              # Data access layer (Supabase + SQLite fallback)
│       ├── auth.ts                  # API key verification
│       ├── openai.ts                # Embedding generator
│       └── tools-schema.ts          # Agent tool definitions
├── scripts/
│   ├── migrate_to_supabase.py       # Automated SQLite -> Supabase migration
│   └── generate_embeddings.py       # pgvector OpenAI embedding pipeline
├── sdks/
│   ├── python/astrodb_client.py     # Python Client for AI Agents
│   ├── typescript/astrodb-client.ts # TypeScript Client for Node/Edge
│   └── mcp_server.py                # MCP Stdio Bridge Server for Claude/Cursor
├── supabase_schema.sql              # Complete PostgreSQL / Supabase DDL
├── supabase_seed_data.sql           # Complete 15,482 records bulk seed SQL
├── DEPLOYMENT_GUIDE.md              # Supabase & Vercel deployment walkthrough
└── package.json                     # Next.js 14 project configuration
```
