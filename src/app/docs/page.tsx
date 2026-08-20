'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe2, 
  Sparkles, 
  BookOpen,
  Cpu,
  Layers
} from 'lucide-react';

export default function DocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mcpClaudeConfig = `{
  "mcpServers": {
    "astrodb": {
      "command": "python",
      "args": ["sdks/mcp_server.py"],
      "env": {
        "ASTRODB_API_URL": "https://astrodb-production.vercel.app/api/mcp",
        "ASTRODB_API_KEY": "astro_sec_agent_live_key_12345"
      }
    }
  }
}`;

  const pythonSdkCode = `from sdks.python.astrodb_client import AstroDBClient

# Initialize client
client = AstroDBClient(
    base_url="https://astrodb-production.vercel.app",
    api_key="your_api_key_here"
)

# 1. Hybrid semantic search across exoplanets & stars
results = client.search("rocky exoplanets in habitable zone with high ESI", limit=5)
for item in results:
    print(f"Match: {item['primary_name']} - Type: {item['object_type']}")

# 2. Retrieve complete multi-catalog dossier
dossier = client.get_object("Kepler-452 b")
print("Habitability ESI:", dossier["planet_profile"]["esi"])
print("Host Star:", dossier["host_star"]["primary_name"])

# 3. Direct safe read-only SQL
rows = client.query_sql("""
    SELECT primary_name, distance_ly, apparent_magnitude 
    FROM celestial_objects 
    WHERE distance_ly < 30 
    ORDER BY distance_ly ASC 
    LIMIT 10
""")
print(rows)`;

  const tsSdkCode = `import { AstroDBClient } from '@/sdks/typescript/astrodb-client';

const client = new AstroDBClient({
  baseUrl: 'https://astrodb-production.vercel.app',
  apiKey: process.env.ASTRODB_API_KEY,
});

// Search exoplanets
const exoplanets = await client.search('Trappist-1 system habitable planets');
console.log(exoplanets);

// Get object details
const objectDetails = await client.getObject('TRAPPIST-1 e');
console.log(objectDetails);`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Code2 className="w-7 h-7 text-space-cyan" />
          Developer & AI Agent Integration Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete protocols, OpenAPI specifications, Model Context Protocol (MCP) servers, and client SDKs.
        </p>
      </div>

      {/* Model Context Protocol (MCP) Section */}
      <section id="mcp" className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-space-cyan/10 border border-space-cyan/30 text-space-cyan mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Standard Protocol
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Model Context Protocol (MCP) Setup
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add AstroDB tools to Claude Desktop, Cursor, or any MCP-compatible agent runtime.
            </p>
          </div>

          <a
            href="/api/mcp"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-space-cyan"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live MCP Endpoint
          </a>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2 bg-space-900 border border-white/10 rounded-t-xl text-xs font-mono text-slate-400">
            <span>claude_desktop_config.json</span>
            <button
              onClick={() => copyToClipboard(mcpClaudeConfig, 'mcp')}
              className="flex items-center gap-1 text-space-cyan hover:text-white transition-colors"
            >
              {copiedId === 'mcp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'mcp' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 bg-space-950 border-x border-b border-white/10 rounded-b-xl text-xs font-mono text-slate-300 overflow-x-auto">
            {mcpClaudeConfig}
          </pre>
        </div>
      </section>

      {/* SDK Section */}
      <section id="sdks" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Python SDK */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Terminal className="w-4 h-4 text-space-cyan" />
              Python Agent SDK (`astrodb_client.py`)
            </div>
            <button
              onClick={() => copyToClipboard(pythonSdkCode, 'python')}
              className="flex items-center gap-1 text-xs text-space-cyan font-mono hover:text-white"
            >
              {copiedId === 'python' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-4 bg-space-950 border border-white/10 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[360px]">
            {pythonSdkCode}
          </pre>
        </div>

        {/* TypeScript SDK */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Code2 className="w-4 h-4 text-space-nebula" />
              TypeScript SDK (`astrodb-client.ts`)
            </div>
            <button
              onClick={() => copyToClipboard(tsSdkCode, 'ts')}
              className="flex items-center gap-1 text-xs text-space-cyan font-mono hover:text-white"
            >
              {copiedId === 'ts' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-4 bg-space-950 border border-white/10 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[360px]">
            {tsSdkCode}
          </pre>
        </div>
      </section>

      {/* REST Endpoints Reference */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-space-cyan" />
            Core REST API Routes
          </h2>
          <a
            href="/api/openapi.json"
            target="_blank"
            className="text-xs text-space-cyan font-mono hover:underline flex items-center gap-1"
          >
            OpenAPI Spec <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-3 text-xs font-mono">
          {[
            { method: 'GET', path: '/api/v1/search?q={query}&type={type}', desc: 'Hybrid pgvector semantic and keyword search' },
            { method: 'GET', path: '/api/v1/objects?limit=50&offset=0', desc: 'Paginated list of celestial bodies with filters' },
            { method: 'GET', path: '/api/v1/objects/{id_or_name}', desc: 'Complete relational dossier across all 16 tables' },
            { method: 'GET', path: '/api/v1/systems/{system_id}', desc: 'Star system hierarchy (stars + orbiting planets)' },
            { method: 'GET', path: '/api/v1/catalogs/{type}', desc: 'Specialized sub-catalogs (exoplanets, stars, astrobiology, relics)' },
            { method: 'POST', path: '/api/v1/query', desc: 'Safe read-only SELECT SQL execution sandbox' },
            { method: 'GET', path: '/api/v1/tools', desc: 'JSON tool schema exports for OpenAI & LangChain function calling' },
            { method: 'POST', path: '/api/mcp', desc: 'Model Context Protocol JSON-RPC 2.0 endpoint' },
          ].map((ep, i) => (
            <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ep.method === 'GET' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {ep.method}
                </span>
                <span className="text-white font-semibold">{ep.path}</span>
              </div>
              <span className="text-slate-400 font-sans text-xs">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
