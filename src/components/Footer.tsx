import React from 'react';
import { Database, Cpu, Sparkles, Terminal, Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-space-950/90 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-space-cyan flex items-center justify-center">
                <Compass className="w-4 h-4 text-space-950" />
              </div>
              <span className="font-bold text-white tracking-wide">AstroDB</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-precision astronomical database, relational telemetry, and pgvector knowledge gateway designed for autonomous AI agents, researchers, and stargazers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Database Catalogs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/explorer?type=Exoplanet" className="hover:text-space-cyan transition-colors">2,000+ Exoplanets & TTV</a></li>
              <li><a href="/explorer?type=Star" className="hover:text-space-cyan transition-colors">Spectroscopic Star Systems</a></li>
              <li><a href="/explorer?tab=astrobiology" className="hover:text-space-cyan transition-colors">Astrobiology & Habitability</a></li>
              <li><a href="/explorer?type=Galaxy" className="hover:text-space-cyan transition-colors">Extragalactic Cosmic Web</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Agent Tooling & Protocols</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/docs#mcp" className="hover:text-space-cyan transition-colors">Model Context Protocol (MCP)</a></li>
              <li><a href="/api/openapi.json" target="_blank" className="hover:text-space-cyan transition-colors">OpenAPI 3.0 Specification</a></li>
              <li><a href="/api/v1/tools" target="_blank" className="hover:text-space-cyan transition-colors">Function Calling JSON Schemas</a></li>
              <li><a href="/docs#sdks" className="hover:text-space-cyan transition-colors">Python & TypeScript SDKs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Infrastructure Stack</h4>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Supabase Postgres</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">pgvector</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Vercel Serverless</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Next.js App Router</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">MCP JSON-RPC</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} AstroDB. Distributed under open scientific license.</div>
          <div className="mt-2 sm:mt-0 flex gap-4">
            <span className="text-slate-400">16 Relational Tables</span>
            <span>•</span>
            <span className="text-slate-400">15,480+ Cross-Indexed Records</span>
            <span>•</span>
            <span className="text-slate-400">pgvector 1536D</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
