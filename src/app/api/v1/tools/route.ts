import { NextResponse } from 'next/server';
import { ASTRODB_TOOLS } from '@/lib/tools-schema';

export async function GET() {
  return NextResponse.json({
    description: 'AstroDB AI Agent Tooling Schemas',
    version: '1.0.0',
    openai_tools: ASTRODB_TOOLS.map(t => ({
      type: 'function',
      function: t,
    })),
    anthropic_tools: ASTRODB_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    })),
    mcp_tools: ASTRODB_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.parameters,
    })),
  });
}
