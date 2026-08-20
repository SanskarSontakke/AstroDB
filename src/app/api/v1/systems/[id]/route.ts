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

  const systemIdOrName = decodeURIComponent(params.id);

  try {
    if (isSupabaseConfigured && supabase) {
      let { data: system } = await supabase
        .from('star_systems')
        .select('*')
        .eq('id', systemIdOrName)
        .maybeSingle();

      if (!system) {
        const { data: byName } = await supabase
          .from('star_systems')
          .select('*')
          .ilike('system_name', `%${systemIdOrName}%`)
          .maybeSingle();
        system = byName;
      }

      if (!system) {
        return NextResponse.json({ error: `Star system "${systemIdOrName}" not found.` }, { status: 404 });
      }

      // Fetch stars in this system
      const { data: stars } = await supabase
        .from('stars')
        .select('*, celestial_objects(*)')
        .eq('star_system_id', system.id);

      const starIds = stars?.map((s: any) => s.object_id) || [];
      
      // Fetch exoplanets orbiting these stars
      const { data: planets } = starIds.length > 0
        ? await supabase
            .from('planets_exoplanets')
            .select('*, celestial_objects(*), astrobiology_habitability(*)')
            .in('host_star_id', starIds)
        : { data: [] };

      return NextResponse.json({
        system,
        stars: stars || [],
        planets: planets || [],
      });
    }

    // SQLite Local Fallback
    const db = getLocalDatabase();
    if (db) {
      let system = db.prepare('SELECT * FROM star_systems WHERE id = ? OR system_name LIKE ?').get(systemIdOrName, `%${systemIdOrName}%`);
      if (!system) {
        return NextResponse.json({ error: `Star system "${systemIdOrName}" not found.` }, { status: 404 });
      }

      const stars = db.prepare(`
        SELECT s.*, c.primary_name, c.apparent_magnitude, c.distance_ly, c.ra_deg, c.dec_deg
        FROM stars s
        JOIN celestial_objects c ON s.object_id = c.id
        WHERE s.star_system_id = ?
      `).all(system.id);

      const starIds = stars.map((s: any) => s.object_id);
      let planets: any[] = [];
      if (starIds.length > 0) {
        const placeholders = starIds.map(() => '?').join(',');
        planets = db.prepare(`
          SELECT p.*, c.primary_name, c.apparent_magnitude, c.distance_ly, a.esi as habitability_esi, a.bio_potential_score
          FROM planets_exoplanets p
          JOIN celestial_objects c ON p.object_id = c.id
          LEFT JOIN astrobiology_habitability a ON p.object_id = a.object_id
          WHERE p.host_star_id IN (${placeholders})
        `).all(...starIds);
      }

      return NextResponse.json({
        system,
        stars,
        planets,
      });
    }

    return NextResponse.json({ error: 'Database backend not ready' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching system' }, { status: 500 });
  }
}
