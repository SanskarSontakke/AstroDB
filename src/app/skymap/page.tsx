'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Orbit, Compass, Sparkles, Eye, Filter, Loader2 } from 'lucide-react';

interface SkyObject {
  id: string;
  primary_name: string;
  object_type: string;
  constellation: string;
  ra_deg: number;
  dec_deg: number;
  distance_ly: number;
  apparent_magnitude: number;
}

export default function SkyMapPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [objects, setObjects] = useState<SkyObject[]>([]);
  const [selected, setSelected] = useState<SkyObject | null>(null);
  const [hovered, setHovered] = useState<SkyObject | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch coordinates
  useEffect(() => {
    async function loadObjects() {
      try {
        const res = await fetch('/api/v1/objects?limit=200');
        const json = await res.json();
        if (json.data) {
          const validCoords = json.data.filter((d: any) => d.ra_deg !== null && d.dec_deg !== null);
          setObjects(validCoords);
          if (validCoords.length > 0) {
            setSelected(validCoords[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadObjects();
  }, []);

  // Continuous animation loop for celestial sphere rotation
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      if (isRotating) {
        setRotationAngle((prev) => (prev + 0.003) % (Math.PI * 2));
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.42;

      ctx.clearRect(0, 0, width, height);

      // Draw Celestial Sphere Background
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
      grad.addColorStop(0, '#0c1322');
      grad.addColorStop(0.8, '#060a12');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere Grid Rings (Equator & Parallels)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      [-45, 0, 45].forEach((lat) => {
        const latRad = (lat * Math.PI) / 180;
        const rLat = radius * Math.cos(latRad);
        const yLat = centerY - radius * Math.sin(latRad) * 0.35;
        ctx.beginPath();
        ctx.ellipse(centerX, yLat, rLat, rLat * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Sphere Border Glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Filtered objects
      const filtered = filterType === 'All' ? objects : objects.filter((o) => o.object_type.toLowerCase().includes(filterType.toLowerCase()));

      // Project 3D Spherical Coordinates (RA / Dec) onto 2D viewport with rotation
      filtered.forEach((obj) => {
        const raRad = ((obj.ra_deg || 0) * Math.PI) / 180 + rotationAngle;
        const decRad = ((obj.dec_deg || 0) * Math.PI) / 180;

        // 3D Cartesian coordinates
        const x3D = Math.cos(decRad) * Math.sin(raRad);
        const y3D = Math.sin(decRad);
        const z3D = Math.cos(decRad) * Math.cos(raRad);

        // Render only forward-facing hemisphere (z3D > -0.2)
        if (z3D > -0.25) {
          const screenX = centerX + x3D * radius;
          const screenY = centerY - y3D * radius * 0.85;

          const isSel = selected?.id === obj.id;
          const isHov = hovered?.id === obj.id;

          // Object color by type
          let color = '#38bdf8'; // cyan for exoplanets
          if (obj.object_type === 'Star') color = '#f59e0b';
          if (obj.object_type === 'Galaxy') color = '#ec4899';
          if (obj.object_type.includes('Relic')) color = '#a855f7';

          // Size based on magnitude
          const dotRadius = isSel ? 6 : isHov ? 5 : Math.max(1.8, 4.5 - (obj.apparent_magnitude ? obj.apparent_magnitude * 0.2 : 1.5));

          // Draw Glowing Star Point
          ctx.beginPath();
          ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? '#ffffff' : color;
          ctx.fill();

          if (isSel || isHov) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(screenX, screenY, dotRadius + 4, 0, Math.PI * 2);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px sans-serif';
            ctx.fillText(obj.primary_name, screenX + 10, screenY + 4);
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [objects, selected, hovered, filterType, isRotating, rotationAngle]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.42;

    let closest: SkyObject | null = null;
    let minDistance = 15;

    objects.forEach((obj) => {
      const raRad = ((obj.ra_deg || 0) * Math.PI) / 180 + rotationAngle;
      const decRad = ((obj.dec_deg || 0) * Math.PI) / 180;
      const x3D = Math.cos(decRad) * Math.sin(raRad);
      const y3D = Math.sin(decRad);
      const z3D = Math.cos(decRad) * Math.cos(raRad);

      if (z3D > -0.25) {
        const screenX = centerX + x3D * radius;
        const screenY = centerY - y3D * radius * 0.85;
        const dist = Math.hypot(screenX - clickX, screenY - clickY);
        if (dist < minDistance) {
          minDistance = dist;
          closest = obj;
        }
      }
    });

    if (closest) {
      setSelected(closest);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Orbit className="w-7 h-7 text-space-starlight animate-spin-slow" />
            3D Celestial Sphere & Coordinate Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time projection of equatorial coordinates (RA / Dec) onto a 3D celestial sphere.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isRotating
                ? 'bg-space-cyan/20 border-space-cyan/40 text-space-cyan'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            {isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          </button>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-space-950/80 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-space-cyan"
          >
            <option value="All">All Types ({objects.length})</option>
            <option value="Exoplanet">Exoplanets</option>
            <option value="Star">Stars</option>
            <option value="Galaxy">Galaxies</option>
            <option value="Relic">Compact Relics</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Projection Area */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-4 border border-white/10 flex items-center justify-center relative min-h-[550px]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-space-950/80 rounded-3xl z-10">
              <Loader2 className="w-8 h-8 animate-spin text-space-cyan mb-2" />
              <span className="text-xs text-slate-400">Loading celestial coordinates...</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={700}
            height={520}
            onClick={handleCanvasClick}
            className="w-full max-w-[700px] h-auto cursor-crosshair"
          />
          <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-500">
            Click any star on the sphere to inspect.
          </div>
        </div>

        {/* Selected Star Telemetry Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-space-cyan font-mono">
                Target Astrometry
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300">
                {selected?.object_type || 'Selected'}
              </span>
            </div>

            {selected ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{selected.primary_name}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Constellation: {selected.constellation || '—'}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Right Ascension</span>
                    <span className="font-mono text-white">{selected.ra_deg ? `${Number(selected.ra_deg).toFixed(3)}°` : '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Declination</span>
                    <span className="font-mono text-white">{selected.dec_deg ? `${Number(selected.dec_deg).toFixed(3)}°` : '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Distance</span>
                    <span className="font-mono text-white">{selected.distance_ly ? `${Number(selected.distance_ly).toLocaleString()} ly` : '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Apparent Magnitude</span>
                    <span className="font-mono text-white">{selected.apparent_magnitude ?? '—'}</span>
                  </div>
                </div>

                <a
                  href={`/objects/${encodeURIComponent(selected.id)}`}
                  className="w-full py-2.5 bg-gradient-to-r from-space-cyan to-space-nebula text-space-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Complete Dossier
                </a>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Select a celestial body from the sphere to view coordinate telemetry.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
