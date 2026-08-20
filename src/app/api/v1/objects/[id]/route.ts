import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getLocalDatabase } from '@/lib/supabase';
import { validateAgentAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = validateAgentAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const idOrName = decodeURIComponent(params.id);

  try {
    let baseObject: any = null;
    let starData: any = null;
    let planetData: any = null;
    let astroHabitability: any = null;
    let interstellarData: any = null;
    let compactRelic: any = null;
    let galaxyData: any = null;
    let deepSkyData: any = null;
    let molecularCloud: any = null;
    let supernovaRemnant: any = null;
    let minorBody: any = null;
    let orbitalElements: any[] = [];
    let transits: any[] = [];
    let moons: any[] = [];
    let crossReferences: any[] = [];
    let hostStar: any = null;
    let systemPlanets: any[] = [];

    // 1. Supabase Fetching
    if (isSupabaseConfigured && supabase) {
      // Find object by ID or primary_name
      let { data: obj } = await supabase
        .from('celestial_objects')
        .select('*')
        .eq('id', idOrName)
        .maybeSingle();

      if (!obj) {
        const { data: byName } = await supabase
          .from('celestial_objects')
          .select('*')
          .ilike('primary_name', idOrName)
          .maybeSingle();
        obj = byName;
      }

      if (!obj) {
        return NextResponse.json({ error: `Celestial object "${idOrName}" not found.` }, { status: 404 });
      }

      baseObject = obj;
      const objId = obj.id;

      // Parallel queries across extension tables
      const [
        starRes,
        planetRes,
        astroRes,
        interRes,
        relicRes,
        galRes,
        dsoRes,
        cloudRes,
        snrRes,
        minorRes,
        orbitRes,
        transitRes,
        moonsRes,
        xrefRes,
      ] = await Promise.all([
        supabase.from('stars').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('planets_exoplanets').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('astrobiology_habitability').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('interstellar_and_rogue_objects').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('compact_relics_and_gw').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('galaxies').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('deep_sky_objects').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('molecular_clouds_dark_nebulae').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('supernova_remnants_pne').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('minor_bodies').select('*').eq('object_id', objId).maybeSingle(),
        supabase.from('orbital_elements').select('*').or(`object_id.eq.${objId},parent_object_id.eq.${objId}`),
        supabase.from('transits_and_events').select('*').or(`object_id.eq.${objId},target_star_id.eq.${objId}`),
        supabase.from('moons').select('*').eq('parent_planet_id', objId),
        supabase.from('catalog_cross_references').select('*').eq('object_id', objId),
      ]);

      starData = starRes.data;
      planetData = planetRes.data;
      astroHabitability = astroRes.data;
      interstellarData = interRes.data;
      compactRelic = relicRes.data;
      galaxyData = galRes.data;
      deepSkyData = dsoRes.data;
      molecularCloud = cloudRes.data;
      supernovaRemnant = snrRes.data;
      minorBody = minorRes.data;
      orbitalElements = orbitRes.data || [];
      transits = transitRes.data || [];
      moons = moonsRes.data || [];
      crossReferences = xrefRes.data || [];

      // If it's a planet, get host star
      if (planetData?.host_star_id) {
        const { data: hs } = await supabase
          .from('celestial_objects')
          .select('id, primary_name, object_type, apparent_magnitude')
          .eq('id', planetData.host_star_id)
          .maybeSingle();
        hostStar = hs;
      }

      // If it's a star, get its planets
      if (starData) {
        const { data: planets } = await supabase
          .from('planets_exoplanets')
          .select('object_id, planet_letter, planet_subtype, mass_earth, in_habitable_zone, esi')
          .eq('host_star_id', objId);
        systemPlanets = planets || [];
      }
    } else {
      // 2. Local SQLite Fetching
      const db = getLocalDatabase();
      if (!db) {
        return NextResponse.json({ error: 'Database backend not ready' }, { status: 500 });
      }

      baseObject = db.prepare('SELECT * FROM celestial_objects WHERE id = ? OR primary_name = ? COLLATE NOCASE').get(idOrName, idOrName);

      if (!baseObject) {
        return NextResponse.json({ error: `Celestial object "${idOrName}" not found.` }, { status: 404 });
      }

      const objId = baseObject.id;
      starData = db.prepare('SELECT * FROM stars WHERE object_id = ?').get(objId);
      planetData = db.prepare('SELECT * FROM planets_exoplanets WHERE object_id = ?').get(objId);
      astroHabitability = db.prepare('SELECT * FROM astrobiology_habitability WHERE object_id = ?').get(objId);
      interstellarData = db.prepare('SELECT * FROM interstellar_and_rogue_objects WHERE object_id = ?').get(objId);
      compactRelic = db.prepare('SELECT * FROM compact_relics_and_gw WHERE object_id = ?').get(objId);
      galaxyData = db.prepare('SELECT * FROM galaxies WHERE object_id = ?').get(objId);
      deepSkyData = db.prepare('SELECT * FROM deep_sky_objects WHERE object_id = ?').get(objId);
      molecularCloud = db.prepare('SELECT * FROM molecular_clouds_dark_nebulae WHERE object_id = ?').get(objId);
      supernovaRemnant = db.prepare('SELECT * FROM supernova_remnants_pne WHERE object_id = ?').get(objId);
      minorBody = db.prepare('SELECT * FROM minor_bodies WHERE object_id = ?').get(objId);
      orbitalElements = db.prepare('SELECT * FROM orbital_elements WHERE object_id = ? OR parent_object_id = ?').all(objId, objId);
      transits = db.prepare('SELECT * FROM transits_and_events WHERE object_id = ? OR target_star_id = ?').all(objId, objId);
      moons = db.prepare('SELECT * FROM moons WHERE parent_planet_id = ?').all(objId);
      crossReferences = db.prepare('SELECT * FROM catalog_cross_references WHERE object_id = ?').all(objId);

      if (planetData?.host_star_id) {
        hostStar = db.prepare('SELECT id, primary_name, object_type, apparent_magnitude FROM celestial_objects WHERE id = ?').get(planetData.host_star_id);
      }

      if (starData) {
        systemPlanets = db.prepare('SELECT object_id, planet_letter, planet_subtype, mass_earth, in_habitable_zone, esi FROM planets_exoplanets WHERE host_star_id = ?').all(objId);
      }
    }

    return NextResponse.json({
      object: baseObject,
      star_profile: starData || null,
      planet_profile: planetData || null,
      astrobiology_profile: astroHabitability || null,
      interstellar_profile: interstellarData || null,
      compact_relic_profile: compactRelic || null,
      galaxy_profile: galaxyData || null,
      deep_sky_profile: deepSkyData || null,
      molecular_cloud_profile: molecularCloud || null,
      supernova_remnant_profile: supernovaRemnant || null,
      minor_body_profile: minorBody || null,
      orbital_elements: orbitalElements,
      transit_events: transits,
      moons: moons,
      cross_references: crossReferences,
      host_star: hostStar,
      system_planets: systemPlanets,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching object details' }, { status: 500 });
  }
}
