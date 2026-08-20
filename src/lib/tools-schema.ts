/**
 * Standardized AI Agent Tool Definitions
 * Compatible with OpenAI Function Calling, LangChain, LlamaIndex, and Model Context Protocol (MCP)
 */

export const ASTRODB_TOOLS = [
  {
    name: 'search_celestial_objects',
    description: 'Search for astronomical bodies across the AstroDB catalog using hybrid natural language semantic search and structured filters (constellation, type, distance, magnitude).',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query (e.g., "rocky exoplanets in habitable zone", "pulsar with shortest period", "Betelgeuse spectral class")',
        },
        object_type: {
          type: 'string',
          description: 'Optional filter by object type (e.g., "Exoplanet", "Star", "Galaxy", "Nebula", "Pulsar", "Quasar", "Supernova Remnant")',
        },
        constellation: {
          type: 'string',
          description: 'Optional 3-letter IAU constellation abbreviation (e.g., "Ori", "UMa", "Cyg", "Tau")',
        },
        max_distance_ly: {
          type: 'number',
          description: 'Optional maximum distance in light years from Earth',
        },
        limit: {
          type: 'integer',
          description: 'Number of results to return (default: 10, max: 50)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_celestial_object',
    description: 'Retrieve the complete relational dossier for a specific celestial body, including linked host stars, exoplanetary systems, moons, orbital elements, transit events, and habitability metrics.',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique AstroDB ID or primary name of the object (e.g., "OBJ-0001", "Kepler-452 b", "TRAPPIST-1 e", "Betelgeuse")',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'query_exoplanets',
    description: 'Query exoplanets with specialized astrophysical filters such as Earth Similarity Index (ESI), Habitable Zone status, discovery method, and planetary subtype.',
    parameters: {
      type: 'object',
      properties: {
        in_habitable_zone: {
          type: 'boolean',
          description: 'Filter for exoplanets inside their host star habitable zone',
        },
        min_esi: {
          type: 'number',
          description: 'Minimum Earth Similarity Index (0.0 to 1.0, e.g., 0.8 for Earth analogues)',
        },
        planet_subtype: {
          type: 'string',
          description: 'Subtype (e.g., "Super-Earth", "Sub-Neptune", "Hot Jupiter", "Terrestrial")',
        },
        discovery_method: {
          type: 'string',
          description: 'Method (e.g., "Transit", "Radial Velocity", "Direct Imaging")',
        },
        limit: {
          type: 'integer',
          description: 'Max records (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'query_star_system',
    description: 'Retrieve the hierarchical architecture of a star system, listing all constituent stellar components, spectral classes, and orbiting planetary bodies.',
    parameters: {
      type: 'object',
      properties: {
        system_id_or_name: {
          type: 'string',
          description: 'System ID or Star Name (e.g., "Alpha Centauri", "TRAPPIST-1", "Kepler-90")',
        },
      },
      required: ['system_id_or_name'],
    },
  },
  {
    name: 'query_astrobiology_profile',
    description: 'Retrieve detailed astrobiological assessment including Bio Potential Score, Planetary Habitability Index (PHI), tidal locking, magnetic dipole moment, and target biosignature gases.',
    parameters: {
      type: 'object',
      properties: {
        planet_name_or_id: {
          type: 'string',
          description: 'Planet name or object ID (e.g., "Proxima Centauri b", "K2-18 b", "Europa")',
        },
      },
      required: ['planet_name_or_id'],
    },
  },
  {
    name: 'execute_astro_sql',
    description: 'Execute a custom safe read-only SQL SELECT query against the 16 relational tables of the AstroDB astronomical database.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'A read-only SQL SELECT statement (e.g., "SELECT primary_name, distance_ly, apparent_magnitude FROM celestial_objects WHERE distance_ly < 20 ORDER BY distance_ly ASC LIMIT 10")',
        },
      },
      required: ['query'],
    },
  },
];
