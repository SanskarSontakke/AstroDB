/**
 * AstroDB TypeScript Client for AI Agents and Next.js / Node runtimes
 */

export interface AstroDBConfig {
  baseUrl?: string;
  apiKey?: string;
}

export class AstroDBClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: AstroDBConfig = {}) {
    this.baseUrl = (config.baseUrl || process.env.ASTRODB_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    this.apiKey = config.apiKey || process.env.ASTRODB_API_KEY;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `AstroDB request failed with status ${res.status}`);
    }

    return res.json();
  }

  /**
   * Hybrid semantic & structured search
   */
  async search(query: string, options: { objectType?: string; constellation?: string; limit?: number } = {}) {
    const params = new URLSearchParams({ q: query, limit: String(options.limit || 10) });
    if (options.objectType) params.append('type', options.objectType);
    if (options.constellation) params.append('constellation', options.constellation);

    const res: any = await this.request(`/api/v1/search?${params.toString()}`);
    return res.results || res.data || [];
  }

  /**
   * Get complete object dossier
   */
  async getObject(idOrName: string) {
    return this.request(`/api/v1/objects/${encodeURIComponent(idOrName)}`);
  }

  /**
   * Get star system architecture
   */
  async getSystem(systemIdOrName: string) {
    return this.request(`/api/v1/systems/${encodeURIComponent(systemIdOrName)}`);
  }

  /**
   * Safe read-only SQL query execution
   */
  async querySql(query: string) {
    const res: any = await this.request('/api/v1/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return res.data || [];
  }
}
