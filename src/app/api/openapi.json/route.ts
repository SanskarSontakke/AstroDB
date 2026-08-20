import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'AstroDB API',
      version: '1.0.0',
      description: 'Production Astronomical Database & AI Agent Gateway with Relational SQL & pgvector Semantic Search.',
      contact: {
        name: 'AstroDB Team',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Environment Host',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] },
    ],
    paths: {
      '/api/v1/search': {
        get: {
          summary: 'Hybrid & Semantic Celestial Search',
          description: 'Search celestial objects using vector embeddings, full-text search, and relational filters.',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Natural language or keyword query' },
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Celestial object type (e.g., Exoplanet, Star, Galaxy)' },
            { name: 'constellation', in: 'query', schema: { type: 'string' }, description: '3-letter IAU constellation code' },
            { name: 'max_distance', in: 'query', schema: { type: 'number' }, description: 'Max distance in light years' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Page limit' },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Page offset' },
          ],
          responses: {
            200: {
              description: 'Successful search response',
            },
          },
        },
      },
      '/api/v1/objects': {
        get: {
          summary: 'List Celestial Objects',
          description: 'Retrieve paginated celestial bodies with sorting and filtering.',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'constellation', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'sort', in: 'query', schema: { type: 'string', default: 'primary_name' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
          ],
          responses: { 200: { description: 'Paginated list of objects' } },
        },
      },
      '/api/v1/objects/{id}': {
        get: {
          summary: 'Get Celestial Object Dossier',
          description: 'Retrieve the complete relational graph for an object across all 16 tables.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Object ID or Primary Name' },
          ],
          responses: { 200: { description: 'Full relational object profile' }, 404: { description: 'Object not found' } },
        },
      },
      '/api/v1/systems/{id}': {
        get: {
          summary: 'Get Star System Hierarchy',
          description: 'Fetch all stars and orbiting exoplanets in a star system.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'System ID or Name' },
          ],
          responses: { 200: { description: 'Star system hierarchy' } },
        },
      },
      '/api/v1/catalogs/{type}': {
        get: {
          summary: 'Query Specific Astronomical Catalog',
          description: 'Query specialized sub-catalogs (exoplanets, stars, astrobiology, galaxies, relics, etc.)',
          parameters: [
            { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['exoplanets', 'stars', 'astrobiology', 'galaxies', 'deep-sky', 'relics', 'interstellar'] } },
            { name: 'in_habitable_zone', in: 'query', schema: { type: 'boolean' } },
            { name: 'min_esi', in: 'query', schema: { type: 'number' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          ],
          responses: { 200: { description: 'Catalog records' } },
        },
      },
      '/api/v1/query': {
        post: {
          summary: 'Execute Safe Read-Only SQL Query',
          description: 'Allows AI agents to execute direct SELECT queries against the 16 tables.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', example: 'SELECT primary_name, distance_ly FROM celestial_objects WHERE distance_ly < 20' },
                  },
                  required: ['query'],
                },
              },
            },
          },
          responses: { 200: { description: 'SQL result set' }, 403: { description: 'Forbidden keyword or non-SELECT query' } },
        },
      },
      '/api/mcp': {
        post: {
          summary: 'Model Context Protocol (MCP) JSON-RPC Endpoint',
          description: 'MCP endpoint supporting tools/list and tools/call for Claude Desktop, Cursor, and Agent frameworks.',
          responses: { 200: { description: 'MCP JSON-RPC response' } },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
