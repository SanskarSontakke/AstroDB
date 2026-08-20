'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Orbit, 
  Sparkles, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  Atom,
  Flame,
  Globe2,
  Eye
} from 'lucide-react';

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'exoplanets' | 'stars' | 'astrobiology' | 'relics' | 'galaxies'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [constellation, setConstellation] = useState('');
  const [hzOnly, setHzOnly] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const tabs = [
    { id: 'all', label: 'All Objects', count: '3,559' },
    { id: 'exoplanets', label: 'Exoplanets', count: '1,599' },
    { id: 'stars', label: 'Stars & Systems', count: '1,672' },
    { id: 'astrobiology', label: 'Astrobiology / HZ', count: '64' },
    { id: 'relics', label: 'Compact Relics', count: '12' },
    { id: 'galaxies', label: 'Galaxies', count: '34' },
  ];

  const constellations = [
    'All', 'And', 'Ant', 'Aps', 'Aqr', 'Aql', 'Ara', 'Ari', 'Aur', 'Boo', 'Cae', 'Cam', 'Cnc', 'CVn', 'CMa', 'CMi', 'Cap', 'Car', 'Cas', 'Cen', 'Cep', 'Cet', 'Cha', 'Cir', 'Col', 'Com', 'CrA', 'CrB', 'Crv', 'Crt', 'Cru', 'Cyg', 'Del', 'Dor', 'Dra', 'Equ', 'Eri', 'For', 'Gem', 'Gru', 'Her', 'Hor', 'Hya', 'Hyi', 'Ind', 'Lac', 'Leo', 'LMi', 'Lep', 'Lib', 'Lup', 'Lyn', 'Lyr', 'Men', 'Mic', 'Mon', 'Mus', 'Nor', 'Oct', 'Oph', 'Ori', 'Pav', 'Peg', 'Per', 'Phe', 'Pic', 'Psc', 'PsA', 'Pup', 'Pyx', 'Ret', 'Sge', 'Sgr', 'Sco', 'Scl', 'Sct', 'Ser', 'Sex', 'Tau', 'Tel', 'Tri', 'TrA', 'Tuc', 'UMa', 'UMi', 'Vel', 'Vir', 'Vol', 'Vul'
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let url = '';
        const offset = (page - 1) * pageSize;

        if (activeTab === 'all') {
          url = `/api/v1/objects?limit=${pageSize}&offset=${offset}`;
          if (constellation && constellation !== 'All') url += `&constellation=${constellation}`;
          if (searchQuery) url = `/api/v1/search?q=${encodeURIComponent(searchQuery)}&limit=${pageSize}&offset=${offset}`;
        } else {
          url = `/api/v1/catalogs/${activeTab}?limit=${pageSize}&offset=${offset}`;
          if (hzOnly && activeTab === 'exoplanets') url += `&in_habitable_zone=true`;
        }

        const res = await fetch(url);
        const json = await res.json();

        if (json.results) {
          setData(json.results);
          setTotalCount(json.count || json.results.length);
        } else if (json.data) {
          setData(json.data);
          setTotalCount(json.count || json.total || json.data.length);
        } else {
          setData([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchData, 200);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, constellation, hzOnly, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Compass className="w-7 h-7 text-space-cyan" />
          Astronomical Catalog Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search, filter, and inspect physical telemetry across all 16 normalized astronomical tables in AstroDB.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-space-cyan text-space-950 font-bold shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              activeTab === tab.id ? 'bg-space-950/30 text-space-950 font-mono' : 'bg-white/10 text-slate-400 font-mono'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by name, catalog ID, or discoverer..."
            className="w-full pl-10 pr-4 py-2 bg-space-950/80 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-space-cyan focus:ring-1 focus:ring-space-cyan"
          />
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Constellation Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={constellation}
              onChange={(e) => {
                setConstellation(e.target.value);
                setPage(1);
              }}
              className="bg-space-950/80 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-space-cyan"
            >
              <option value="">All Constellations</option>
              {constellations.slice(1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Habitable Zone Checkbox (Exoplanets only) */}
          {(activeTab === 'exoplanets' || activeTab === 'all') && (
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 transition-all">
              <input
                type="checkbox"
                checked={hzOnly}
                onChange={(e) => {
                  setHzOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-white/20 text-space-cyan focus:ring-0"
              />
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Habitable Zone Only</span>
            </label>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Primary Designation</th>
                <th className="py-3 px-4">Type / Subtype</th>
                <th className="py-3 px-4">Constellation</th>
                <th className="py-3 px-4">Coordinates (RA / Dec)</th>
                <th className="py-3 px-4">Distance (ly)</th>
                <th className="py-3 px-4">Apparent Mag</th>
                <th className="py-3 px-4">Habitability / ESI</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-space-cyan mb-2" />
                    <span>Querying relational astronomical tables...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No celestial objects matched your search criteria.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const id = row.id || row.object_id || row.primary_name;
                  const name = row.primary_name || row.planet_name || row.cloud_name || row.nebula_name || id;
                  const type = row.object_type || row.planet_subtype || row.category || row.relic_category || 'Object';
                  const constCode = row.constellation || '—';
                  const ra = row.ra_deg !== undefined ? `${Number(row.ra_deg).toFixed(2)}°` : '—';
                  const dec = row.dec_deg !== undefined ? `${Number(row.dec_deg).toFixed(2)}°` : '—';
                  const dist = row.distance_ly !== undefined && row.distance_ly !== null ? `${Number(row.distance_ly).toLocaleString()} ly` : '—';
                  const mag = row.apparent_magnitude !== undefined && row.apparent_magnitude !== null ? row.apparent_magnitude : '—';
                  const esi = row.esi || row.habitability_esi;

                  return (
                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors group">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-space-cyan"></span>
                        <a href={`/objects/${encodeURIComponent(id)}`} className="hover:text-space-cyan hover:underline">
                          {name}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-300">
                          {type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{constCode}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {ra} / {dec}
                      </td>
                      <td className="py-3 px-4 font-mono">{dist}</td>
                      <td className="py-3 px-4 font-mono">{mag}</td>
                      <td className="py-3 px-4">
                        {esi ? (
                          <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            ESI {Number(esi).toFixed(2)}
                          </div>
                        ) : row.in_habitable_zone ? (
                          <span className="text-emerald-400 font-mono text-[11px]">In HZ</span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/objects/${encodeURIComponent(id)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan text-[11px] font-medium transition-all"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-mono">{data.length}</span> of{' '}
            <span className="text-white font-mono">{totalCount.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-white">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.length < pageSize || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white border border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
