import { NextRequest, NextResponse } from 'next/server';

const REQUIRED_API_KEY = process.env.ASTRODB_API_KEY;

/**
 * Validates AI agent API key headers.
 * Accepts `x-api-key: <key>` or `Authorization: Bearer <key>`.
 * In development without ASTRODB_API_KEY set, allows unauthenticated requests.
 */
export function validateAgentAuth(request: NextRequest): { valid: boolean; error?: string } {
  // If no ASTRODB_API_KEY is configured on the server, allow open access
  if (!REQUIRED_API_KEY) {
    return { valid: true };
  }

  const apiKeyHeader = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');

  let token = apiKeyHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return {
      valid: false,
      error: 'Missing API key. Provide "x-api-key" header or "Authorization: Bearer <key>".',
    };
  }

  if (token !== REQUIRED_API_KEY) {
    return {
      valid: false,
      error: 'Invalid API key provided.',
    };
  }

  return { valid: true };
}
