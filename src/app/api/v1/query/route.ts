import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getLocalDatabase } from '@/lib/supabase';
import { validateAgentAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = validateAgentAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sqlQuery = body?.query;

    if (!sqlQuery || typeof sqlQuery !== 'string') {
      return NextResponse.json({ error: 'Missing "query" string in request body.' }, { status: 400 });
    }

    const trimmed = sqlQuery.trim();

    // Guardrail: Enforce SELECT only
    if (!/^\s*SELECT\s+/i.test(trimmed)) {
      return NextResponse.json({ error: 'Security Violation: Only SELECT queries are permitted.' }, { status: 403 });
    }

    // Guardrail: Block dangerous SQL commands
    if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|CREATE|VACUUM)\b/i.test(trimmed)) {
      return NextResponse.json({ error: 'Security Violation: Mutating, DDL, or administrative SQL keywords are forbidden.' }, { status: 403 });
    }

    // 1. Supabase execution via RPC
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('execute_astro_sql', {
        query_text: trimmed,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        query: trimmed,
        rowCount: Array.isArray(data) ? data.length : 0,
        data: data || [],
        source: 'supabase_postgres',
      });
    }

    // 2. SQLite local fallback
    const db = getLocalDatabase();
    if (db) {
      const stmt = db.prepare(trimmed);
      const rows = stmt.all();
      return NextResponse.json({
        query: trimmed,
        rowCount: rows.length,
        data: rows,
        source: 'sqlite_local',
      });
    }

    return NextResponse.json({ error: 'Database backend not ready' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'SQL Execution Error' }, { status: 500 });
  }
}
