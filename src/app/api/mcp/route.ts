import { NextRequest, NextResponse } from 'next/server';
import { ASTRODB_TOOLS } from '@/lib/tools-schema';
import { queryAstroData, getLocalDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/openai';
import { validateAgentAuth } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({
    jsonrpc: '2.0',
    server: {
      name: 'astrodb-mcp-server',
      version: '1.0.0',
      description: 'Model Context Protocol (MCP) Server for AstroDB Astronomical Database',
      protocols: ['application/json', 'application/json-rpc'],
    },
    tools: ASTRODB_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.parameters,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = validateAgentAuth(request);
  if (!auth.valid) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32001, message: auth.error || 'Unauthorized' },
      id: null,
    }, { status: 401 });
  }

  let rpcBody: any;
  try {
    rpcBody = await request.json();
  } catch {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' },
      id: null,
    }, { status: 400 });
  }

  const { jsonrpc, id, method, params } = rpcBody;

  // 1. Initialize
  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'astrodb-server',
          version: '1.0.0',
        },
      },
    });
  }

  // 2. Tools List
  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: ASTRODB_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.parameters,
        })),
      },
    });
  }

  // 3. Tools Call
  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};

    try {
      let outputData: any = null;

      if (name === 'search_celestial_objects') {
        const q = args?.query || '';
        const type = args?.object_type;
        const limit = args?.limit || 10;

        // Try semantic search if Supabase & embedding available
        if (isSupabaseConfigured && supabase && q.length > 2) {
          const emb = await getEmbedding(q);
          if (emb) {
            const { data } = await supabase.rpc('match_celestial_objects', {
              query_embedding: emb,
              match_threshold: 0.2,
              match_count: limit,
              filter_category: type || null,
            });
            outputData = data;
          }
        }

        if (!outputData) {
          const res = await queryAstroData('celestial_objects', {
            filters: type ? { object_type: type } : {},
            limit,
          });
          outputData = res.data;
        }
      } else if (name === 'get_celestial_object') {
        const objId = args?.id;
        const db = getLocalDatabase();
        if (db) {
          const obj = db.prepare('SELECT * FROM celestial_objects WHERE id = ? OR primary_name = ? COLLATE NOCASE').get(objId, objId);
          if (obj) {
            const star = db.prepare('SELECT * FROM stars WHERE object_id = ?').get(obj.id);
            const planet = db.prepare('SELECT * FROM planets_exoplanets WHERE object_id = ?').get(obj.id);
            const astro = db.prepare('SELECT * FROM astrobiology_habitability WHERE object_id = ?').get(obj.id);
            const crossrefs = db.prepare('SELECT * FROM catalog_cross_references WHERE object_id = ?').all(obj.id);
            outputData = { object: obj, star, planet, astrobiology: astro, cross_references: crossrefs };
          }
        } else if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.from('celestial_objects').select('*').eq('id', objId).maybeSingle();
          outputData = data;
        }
      } else if (name === 'query_exoplanets') {
        const res = await queryAstroData('planets_exoplanets', {
          limit: args?.limit || 20,
        });
        outputData = res.data;
      } else if (name === 'query_star_system') {
        const res = await queryAstroData('star_systems', {
          filters: { system_name: `%${args?.system_id_or_name}%` },
          limit: 5,
        });
        outputData = res.data;
      } else if (name === 'query_astrobiology_profile') {
        const res = await queryAstroData('astrobiology_habitability', {
          filters: { planet_name: `%${args?.planet_name_or_id}%` },
          limit: 5,
        });
        outputData = res.data;
      } else if (name === 'execute_astro_sql') {
        const sql = args?.query || '';
        if (!/^\s*SELECT\s+/i.test(sql)) {
          throw new Error('Only SELECT queries are permitted.');
        }
        const db = getLocalDatabase();
        if (db) {
          outputData = db.prepare(sql).all();
        } else if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.rpc('execute_astro_sql', { query_text: sql });
          if (error) throw error;
          outputData = data;
        }
      } else {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool "${name}" not found.` },
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(outputData, null, 2),
            },
          ],
        },
      });
    } catch (toolErr: any) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Tool Execution Error: ${toolErr.message}`,
            },
          ],
        },
      });
    }
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method "${method}" not recognized.` },
  });
}
