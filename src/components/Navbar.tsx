'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, Database, Code2, Globe2, Orbit } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Catalog Explorer', href: '/explorer', icon: Database },
    { name: '3D Sky Map', href: '/skymap', icon: Orbit },
    { name: 'AI Playground', href: '/playground', icon: Sparkles },
    { name: 'Developer Hub', href: '/docs', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-space-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-space-cyan via-space-nebula to-space-cosmic flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-space-cyan bg-clip-text text-transparent">
              AstroDB
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
              AI Agent Knowledge Gateway
            </div>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-space-cyan shadow-sm border border-space-cyan/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-space-cyan' : 'text-slate-400'}`} />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Live Backend Status Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL & MCP Online
          </div>
          <a
            href="/docs"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-space-cyan to-space-nebula text-space-950 hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5" />
            Connect Agent
          </a>
        </div>
      </div>
    </header>
  );
}
