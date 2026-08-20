'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ArrowLeft, 
  Orbit, 
  Sparkles, 
  Flame, 
  Globe2, 
  Layers, 
  Activity, 
  Hash, 
  ExternalLink,
  Loader2,
  Atom,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function ObjectDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/v1/objects/${encodeURIComponent(params.id)}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Object not found');
        } else {
          setData(json);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-space-cyan mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Querying relational astrophysics dossier...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Object Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'The requested celestial body could not be located in AstroDB.'}</p>
        <a href="/explorer" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all">
          ← Return to Explorer
        </a>
      </div>
    );
  }

  const {
    object: obj,
    star_profile: star,
    planet_profile: planet,
    astrobiology_profile: astro,
    orbital_elements: orbits,
    transit_events: transits,
    cross_references: xrefs,
    host_star: hostStar,
    system_planets: planets,
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <a
          href="/explorer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Explorer
        </a>

        <a
          href={`/api/v1/objects/${encodeURIComponent(params.id)}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-space-cyan transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Raw JSON Payload
        </a>
      </div>

      {/* Main Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden bg-gradient-to-r from-space-900/90 via-space-950/80 to-space-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-space-cyan/20 border border-space-cyan/40 text-space-cyan">
                {obj.object_type}
              </span>
              {obj.constellation && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
                  Constellation: {obj.constellation}
                </span>
              )}
              {planet?.in_habitable_zone && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Habitable Zone Candidate
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {obj.primary_name}
            </h1>

            <p className="text-xs text-slate-400 mt-2 font-mono">
              Database ID: {obj.id} {obj.discovery_year ? `• Discovered in ${Math.round(obj.discovery_year)} by ${obj.discoverer || 'Survey'}` : ''}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-col items-end gap-2 text-right">
            <div className="text-2xl font-bold text-white font-mono">
              {obj.distance_ly ? `${Number(obj.distance_ly).toLocaleString()} ly` : 'Distance N/A'}
            </div>
            <div className="text-xs text-slate-400">
              Apparent Mag: <span className="text-white font-mono">{obj.apparent_magnitude ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Physical Coordinates & Astrometric Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Astrometric Coordinates */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Compass className="w-4 h-4 text-space-cyan" />
            Celestial Coordinates & Astrometry
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Right Ascension (HMS)</span>
              <span className="font-mono text-white">{obj.ra_j2000_hms || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Right Ascension (deg)</span>
              <span className="font-mono text-white">{obj.ra_deg !== null ? `${obj.ra_deg}°` : '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Declination (DMS)</span>
              <span className="font-mono text-white">{obj.dec_j2000_dms || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Declination (deg)</span>
              <span className="font-mono text-white">{obj.dec_deg !== null ? `${obj.dec_deg}°` : '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Parallax (mas)</span>
              <span className="font-mono text-white">{obj.parallax_mas ?? '—'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Absolute Magnitude</span>
              <span className="font-mono text-white">{obj.absolute_magnitude ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Physical & Spectral Properties */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Flame className="w-4 h-4 text-amber-400" />
            Physical & Stellar Physics
          </div>
          {star ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Spectral Class / Type</span>
                <span className="font-mono text-amber-300 font-bold">{star.spectral_type || `${star.spectral_class}${star.luminosity_class || ''}`}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Effective Temperature</span>
                <span className="font-mono text-white">{star.effective_temp_k ? `${star.effective_temp_k} K` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Mass (Solar)</span>
                <span className="font-mono text-white">{star.mass_solar ? `${star.mass_solar} M☉` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Radius (Solar)</span>
                <span className="font-mono text-white">{star.radius_solar ? `${star.radius_solar} R☉` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Metallicity [Fe/H]</span>
                <span className="font-mono text-white">{star.metallicity_fe_h ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Evolutionary Stage</span>
                <span className="font-mono text-white">{star.evolutionary_stage || 'Main Sequence'}</span>
              </div>
            </div>
          ) : planet ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Planetary Subtype</span>
                <span className="font-mono text-space-cyan font-bold">{planet.planet_subtype || 'Exoplanet'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Mass (Earth / Jupiter)</span>
                <span className="font-mono text-white">{planet.mass_earth ? `${planet.mass_earth} M⊕` : planet.mass_jupiter ? `${planet.mass_jupiter} M_J` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Radius (Earth / Jupiter)</span>
                <span className="font-mono text-white">{planet.radius_earth ? `${planet.radius_earth} R⊕` : planet.radius_jupiter ? `${planet.radius_jupiter} R_J` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Equilibrium Temp</span>
                <span className="font-mono text-white">{planet.equilibrium_temp_k ? `${planet.equilibrium_temp_k} K` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Discovery Method</span>
                <span className="font-mono text-white">{planet.discovery_method || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Earth Similarity Index</span>
                <span className="font-mono text-emerald-400 font-bold">{planet.esi ? planet.esi.toFixed(2) : '—'}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-6 text-center">
              Specialized astrophysical parameters for {obj.object_type}.
            </div>
          )}
        </div>

        {/* Astrobiology & Habitability Radar */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Astrobiology & Biosignature Potential
          </div>
          {astro ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Habitable Zone Status</span>
                <span className="font-mono text-emerald-300 font-semibold">{astro.hz_status || 'Optimistic HZ'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Bio Potential Score</span>
                <span className="font-mono text-emerald-400 font-bold">{astro.bio_potential_score ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Planetary Habitability Index (PHI)</span>
                <span className="font-mono text-white">{astro.phi ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Tidally Locked</span>
                <span className="font-mono text-white">{astro.is_tidally_locked ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Subsurface Ocean Depth</span>
                <span className="font-mono text-white">{astro.subsurface_ocean_depth_km ? `${astro.subsurface_ocean_depth_km} km` : 'None / Unknown'}</span>
              </div>
              <div className="py-1.5 text-slate-400">
                <span>Target Biosignatures: </span>
                <span className="text-white font-mono">{astro.target_biosignatures || 'CO2, H2O, CH4, O3'}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              No direct astrobiological habitability constraints recorded for this object.
            </div>
          )}
        </div>
      </div>

      {/* Orbital Elements & Transit Mechanics */}
      {(orbits.length > 0 || transits.length > 0) && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Orbit className="w-4 h-4 text-space-starlight" />
            Orbital Elements & Transit Photometry
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            {orbits[0] && (
              <>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Semi-Major Axis</div>
                  <div className="text-white text-sm font-bold mt-1">{orbits[0].semi_major_axis_au ? `${orbits[0].semi_major_axis_au} AU` : '—'}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Orbital Period</div>
                  <div className="text-white text-sm font-bold mt-1">{orbits[0].orbital_period_days ? `${orbits[0].orbital_period_days} days` : '—'}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Eccentricity</div>
                  <div className="text-white text-sm font-bold mt-1">{orbits[0].eccentricity ?? '—'}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Orbital Speed</div>
                  <div className="text-white text-sm font-bold mt-1">{orbits[0].orbital_speed_km_s ? `${orbits[0].orbital_speed_km_s} km/s` : '—'}</div>
                </div>
              </>
            )}
            {transits[0] && (
              <>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Transit Duration</div>
                  <div className="text-white text-sm font-bold mt-1">{transits[0].duration_hours ? `${transits[0].duration_hours} hrs` : '—'}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Transit Depth</div>
                  <div className="text-white text-sm font-bold mt-1">{transits[0].transit_depth_percent ? `${transits[0].transit_depth_percent}%` : '—'}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Transit Epoch (BJD)</div>
                  <div className="text-white text-sm font-bold mt-1">{transits[0].transit_epoch_bjd ?? '—'}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[11px]">Impact Parameter</div>
                  <div className="text-white text-sm font-bold mt-1">{transits[0].impact_parameter ?? '—'}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cross-Catalog References */}
      {xrefs && xrefs.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Hash className="w-4 h-4 text-space-cyan" />
            Catalog Cross-References ({xrefs.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {xrefs.map((ref: any, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300"
              >
                <span className="text-space-cyan font-bold">{ref.catalog_name}:</span> {ref.designation}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
