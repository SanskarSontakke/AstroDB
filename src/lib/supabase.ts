import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Supabase Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && (supabaseAnonKey || supabaseServiceKey) && !supabaseUrl.includes('your-project-id')
);

// Supabase Client instance (Public / Anon)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey)
  : null;

// Supabase Admin Client instance (Service Role for admin/backend actions)
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// Local SQLite fallback helper for zero-config offline development
let sqliteDb: any = null;

export function getLocalDatabase() {
  if (typeof window !== 'undefined') return null;
  if (!sqliteDb) {
    try {
      // Dynamic require to prevent bundling on client or edge
      const Database = require('better-sqlite3');
      const dbPath = path.resolve(process.cwd(), '00 - Master Relational Database (SQLite).sqlite');
      sqliteDb = new Database(dbPath, { readonly: true });
    } catch (err) {
      console.warn('SQLite fallback unavailable:', err);
    }
  }
  return sqliteDb;
}

/**
 * Universal query runner: Uses Supabase in production, or SQLite fallback locally
 */
export async function queryAstroData(table: string, options: {
  select?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
} = {}) {
  const {
    select = '*',
    filters = {},
    limit = 50,
    offset = 0,
    orderBy,
    ascending = true,
  } = options;

  if (isSupabaseConfigured && supabase) {
    let query = supabase.from(table).select(select, { count: 'exact' });

    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'string' && val.includes('%')) {
          query = query.ilike(key, val);
        } else {
          query = query.eq(key, val);
        }
      }
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, count: count ?? data?.length ?? 0, source: 'supabase' };
  }

  // Fallback to SQLite
  const db = getLocalDatabase();
  if (db) {
    const whereClauses: string[] = [];
    const params: any[] = [];

    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'string' && val.includes('%')) {
          whereClauses.push(`"${key}" LIKE ?`);
          params.push(val);
        } else {
          whereClauses.push(`"${key}" = ?`);
          params.push(val);
        }
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const orderSql = orderBy ? `ORDER BY "${orderBy}" ${ascending ? 'ASC' : 'DESC'}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM "${table}" ${whereSql}`);
    const countRes = countStmt.get(...params);

    const queryStmt = db.prepare(
      `SELECT ${select} FROM "${table}" ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
    );
    const data = queryStmt.all(...params, limit, offset);

    return { data, count: countRes?.count || 0, source: 'sqlite_local' };
  }

  throw new Error('Neither Supabase credentials nor local SQLite database are accessible.');
}
