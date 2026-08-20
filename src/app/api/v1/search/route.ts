import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getLocalDatabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/openai';
import { validateAgentAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = validateAgentAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('query') || '';
  const type = searchParams.get('type') || searchParams.get('object_type') || '';
  const constellation = searchParams.get('constellation') || '';
  const maxDistance = searchParams.get('max_distance') ? parseFloat(searchParams.get('max_distance')!) : null;
  const minDistance = searchParams.get('min_distance') ? parseFloat(searchParams.get('min_distance')!) : null;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    // 1. If Supabase is active and query text is provided, try pgvector semantic search
    if (isSupabaseConfigured && supabase && q.length > 2) {
      const embedding = await getEmbedding(q);
      if (embedding) {
        const { data: vectorResults, error: rpcError } = await supabase.rpc('match_celestial_objects', {
          query_embedding: embedding,
          match_threshold: 0.2,
          match_count: limit,
          filter_category: type || null,
        });

        if (!rpcError && vectorResults && vectorResults.length > 0) {
          const objectIds = vectorResults.map((r: any) => r.object_id).filter(Boolean);
          if (objectIds.length > 0) {
            const { data: objects } = await supabase
              .from('celestial_objects')
              .select('*')
              .in('id', objectIds);

            // Merge similarity score
            const enriched = vectorResults.map((vr: any) => {
              const obj = objects?.find((o: any) => o.id === vr.object_id);
              return {
                ...obj,
                semantic_title: vr.title,
                semantic_category: vr.category,
                similarity_score: vr.similarity,
                matched_summary: vr.content_chunk,
              };
            });

            return NextResponse.json({
              search_mode: 'semantic_vector',
              count: enriched.length,
              results: enriched,
            });
          }
        }
      }
    }

    // 2. Structured & Keyword Search Fallback
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('celestial_objects').select('*', { count: 'exact' });

      if (q) {
        query = query.or(`primary_name.ilike.%${q}%,discoverer.ilike.%${q}%`);
      }
      if (type) {
        query = query.ilike('object_type', `%${type}%`);
      }
      if (constellation) {
        query = query.ilike('constellation', constellation);
      }
      if (maxDistance !== null) {
        query = query.lte('distance_ly', maxDistance);
      }
      if (minDistance !== null) {
        query = query.gte('distance_ly', minDistance);
      }

      query = query.order('primary_name', { ascending: true }).range(offset, offset + limit - 1);
      const { data, count, error } = await query;
      if (error) throw error;

      return NextResponse.json({
        search_mode: 'structured_relational',
        count: count ?? data?.length ?? 0,
        results: data || [],
      });
    }

    // 3. Local SQLite Fallback
    const db = getLocalDatabase();
    if (db) {
      const where: string[] = [];
      const params: any[] = [];

      if (q) {
        where.push('(primary_name LIKE ? OR object_type LIKE ? OR discoverer LIKE ?)');
        const pattern = `%${q}%`;
        params.push(pattern, pattern, pattern);
      }
      if (type) {
        where.push('object_type LIKE ?');
        params.push(`%${type}%`);
      }
      if (constellation) {
        where.push('constellation = ?');
        params.push(constellation);
      }
      if (maxDistance !== null) {
        where.push('distance_ly <= ?');
        params.push(maxDistance);
      }
      if (minDistance !== null) {
        where.push('distance_ly >= ?');
        params.push(minDistance);
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const countRes = db.prepare(`SELECT COUNT(*) as count FROM celestial_objects ${whereSql}`).get(...params);
      const stmt = db.prepare(`SELECT * FROM celestial_objects ${whereSql} ORDER BY primary_name ASC LIMIT ? OFFSET ?`);
      const rows = stmt.all(...params, limit, offset);

      return NextResponse.json({
        search_mode: 'sqlite_local',
        count: countRes?.count || 0,
        results: rows,
      });
    }

    return NextResponse.json({ error: 'Database backend not ready' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Search Error' }, { status: 500 });
  }
}
