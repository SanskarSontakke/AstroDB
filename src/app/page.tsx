import React from 'react';
import { 
  Sparkles, 
  Database, 
  Orbit, 
  Code2, 
  Search, 
  Compass, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Globe2,
  Atom,
  Radio
} from 'lucide-react';

export default function HomePage() {
  const stats = [
    { label: 'Celestial Objects', val: '3,559', detail: 'Cross-catalog indexed' },
    { label: 'Planets & Exoplanets', val: '1,599', detail: 'TTV, ESI & radius metrics' },
    { label: 'Star Systems & Stars', val: '1,672', detail: 'Spectroscopy & kinematics' },
    { label: 'Habitability & Astrobio', val: '64', detail: 'Atmospheres & bio-scores' },
  ];

  const features = [
    {
      icon: Database,
      title: '16 Relational Tables in Supabase',
      description: 'Normalized PostgreSQL schema with referential integrity covering stars, exoplanets, orbital elements, transits, astrobiology, compact relics, and galaxies.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'pgvector Semantic Knowledge Search',
      description: 'Dense 1536-dimensional embeddings for all celestial bodies. AI agents can query naturally ("find rocky exoplanets with high ESI within 50 light years").',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Code2,
      title: 'Model Context Protocol (MCP) Server',
      description: 'Native MCP JSON-RPC endpoint ready for Claude Desktop, Cursor, and custom agentic frameworks with built-in tool definitions and parameter validation.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: ShieldCheck,
      title: 'Secured Text-to-SQL Sandbox',
      description: 'Guarded read-only SQL endpoint enabling agents to formulate dynamic queries against the database without risk of mutations.',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-space-cyan/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[300px] bg-space-cosmic/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-space-cyan mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AstroDB v1.0 • Supabase & Vercel Native</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Universal Astronomical Knowledge Base for{' '}
          <span className="bg-gradient-to-r from-space-cyan via-space-nebula to-space-cosmic bg-clip-text text-transparent">
            AI Agents
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Access 15,400+ astrophysical records, exoplanetary telemetry, habitable zone models, and spectroscopic data via high-performance REST, pgvector semantic search, and MCP tooling.
        </p>

        {/* Quick Search Action */}
        <div className="mt-8 max-w-xl mx-auto">
          <form action="/explorer" method="GET" className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Search exoplanets, stars, coordinates (e.g. TRAPPIST-1, Kepler-452 b, Betelgeuse)..."
              className="w-full pl-12 pr-28 py-3.5 bg-space-900/90 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-space-cyan focus:ring-2 focus:ring-space-cyan/20 shadow-xl transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-space-cyan to-space-nebula text-space-950 text-xs font-semibold rounded-lg hover:brightness-110 shadow transition-all"
            >
              Explore
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/explorer"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center gap-2 transition-all"
          >
            <Database className="w-4 h-4 text-space-cyan" />
            Browse Catalog
          </a>
          <a
            href="/playground"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-space-cyan/20 to-space-cosmic/20 hover:from-space-cyan/30 hover:to-space-cosmic/30 border border-space-cyan/30 text-space-cyan flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Test AI Playground
          </a>
          <a
            href="/skymap"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-2 transition-all"
          >
            <Orbit className="w-4 h-4 text-space-starlight" />
            3D Celestial Map
          </a>
          <a
            href="/docs"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-2 transition-all"
          >
            <Code2 className="w-4 h-4 text-space-nebula" />
            Agent MCP Docs
          </a>
        </div>
      </section>

      {/* Catalog Metric Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all text-center sm:text-left">
              <div className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text">
                {stat.val}
              </div>
              <div className="text-sm font-semibold text-space-cyan mt-1">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Autonomous Scientific AI
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            From raw transit observations to multi-agent reasoning, AstroDB delivers structured relational queries and semantic intelligence in milliseconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rapid Agent Integration Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-gradient-to-b from-space-900/90 to-space-950/90">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-space-cyan/10 border border-space-cyan/30 text-space-cyan">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                MCP & Function Calling Ready
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Plug Directly into Claude, Cursor & Custom Agents
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your AI agent in seconds using the Model Context Protocol (MCP) or pre-configured Python & TypeScript clients. Agents can autonomously query spectroscopic parameters, resolve orbital elements, and discover habitable worlds.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="/docs#mcp"
                  className="px-4 py-2 bg-space-cyan text-space-950 font-semibold rounded-xl text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  MCP Setup Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/api/openapi.json"
                  target="_blank"
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs border border-white/10 transition-all"
                >
                  View OpenAPI 3.0 Spec
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-space-950 border border-white/15 p-4 shadow-2xl overflow-hidden text-xs font-mono text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    <span className="ml-2 text-slate-400">claude_desktop_config.json</span>
                  </div>
                  <span className="text-[10px] text-space-cyan">MCP 1.0</span>
                </div>
                <pre className="p-3 text-slate-300 bg-transparent overflow-x-auto text-[11px] leading-relaxed">
{`{
  "mcpServers": {
    "astrodb": {
      "command": "npx",
      "args": ["-y", "astrodb-mcp-client"],
      "env": {
        "ASTRODB_API_URL": "https://your-vercel-app.vercel.app/api/mcp",
        "ASTRODB_API_KEY": "your_api_key_here"
      }
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
