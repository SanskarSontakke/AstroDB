import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getLocalDatabase } from '@/lib/supabase';
import { validateAgentAuth } from '@/lib/auth';

const TABLE_MAP: Record<string, string> = {
  exoplanets: 'planets_exoplanets',
  stars: 'stars',
  astrobiology: 'astrobiology_habitability',
  galaxies: 'galaxies',
  'deep-sky': 'deep_sky_objects',
  relics: 'compact_relics_and_gw',
  interstellar: 'interstellar_and_rogue_objects',
  'molecular-clouds': 'molecular_clouds_dark_nebulae',
  supernovae: 'supernova_remnants_pne',
  'minor-bodies': 'minor_bodies',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const auth = validateAgentAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const catalogType = params.type.toLowerCase();
  const tableName = TABLE_MAP[catalogType];

  if (!tableName) {
    return NextResponse.json({
      error: `Unknown catalog type "${catalogType}". Valid types: ${Object.keys(TABLE_MAP).join(', ')}`,
    }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const hzOnly = searchParams.get('in_habitable_zone') === 'true';
  const minEsi = searchParams.get('min_esi') ? parseFloat(searchParams.get('min_esi')!) : null;

  try {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from(tableName)
        .select('*, celestial_objects(*)', { count: 'exact' });

      if (tableName === 'planets_exoplanets') {
        if (hzOnly) query = query.eq('in_habitable_zone', true);
        if (minEsi !== null) query = query.gte('esi', minEsi);
      }

      query = query.range(offset, offset + limit - 1);
      const { data, count, error } = await query;
      if (error) throw error;

      return NextResponse.json({
        catalog: catalogType,
        table: tableName,
        total: count,
        limit,
        offset,
        data: data || [],
      });
    }

    // Local SQLite fallback
    const db = getLocalDatabase();
    if (db) {
      const where: string[] = [];
      const sqlParams: any[] = [];

      if (tableName === 'planets_exoplanets') {
        if (hzOnly) {
          where.push('t.in_habitable_zone = 1');
        }
        if (minEsi !== null) {
          where.push('t.esi >= ?');
          sqlParams.push(minEsi);
        }
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const countRes = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}" t ${whereSql}`).get(...sqlParams);

      const querySql = `
        SELECT t.*, c.primary_name, c.object_type, c.constellation, c.distance_ly, c.apparent_magnitude, c.ra_deg, c.dec_deg
        FROM "${tableName}" t
        JOIN celestial_objects c ON t.object_id = c.id
        ${whereSql}
        LIMIT ? OFFSET ?
      `;

      const data = db.prepare(querySql).all(...sqlParams, limit, offset);

      return NextResponse.json({
        catalog: catalogType,
        table: tableName,
        total: countRes?.count || 0,
        limit,
        offset,
        data,
      });
    }

    return NextResponse.json({ error: 'Database backend not ready' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Catalog query error' }, { status: 500 });
  }
}
