import { NextRequest, NextResponse } from 'next/server';
import { queryAstroData } from '@/lib/supabase';
import { validateAgentAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = validateAgentAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || undefined;
  const constellation = searchParams.get('constellation') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const sort = searchParams.get('sort') || 'primary_name';
  const order = searchParams.get('order') === 'desc' ? false : true;

  const filters: Record<string, any> = {};
  if (type) filters.object_type = type;
  if (constellation) filters.constellation = constellation;

  try {
    const result = await queryAstroData('celestial_objects', {
      filters,
      limit,
      offset,
      orderBy: sort,
      ascending: order,
    });

    return NextResponse.json({
      count: result.count,
      limit,
      offset,
      data: result.data,
      source: result.source,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching objects' }, { status: 500 });
  }
}
