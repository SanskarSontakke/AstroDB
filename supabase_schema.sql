-- ==============================================================================
-- AstroDB: Production Supabase / PostgreSQL Astronomical Database Schema
-- Multi-Catalog Relational & Vector Search Database for AI Agents & Web App
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector extension for semantic embeddings

-- ==============================================================================
-- 1. BASE CELESTIAL OBJECTS TABLE (Parent for all celestial bodies & phenomena)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS celestial_objects (
    id VARCHAR(64) PRIMARY KEY,
    primary_name VARCHAR(150) NOT NULL,
    object_type VARCHAR(64) NOT NULL,
    constellation VARCHAR(10),
    ra_j2000_hms VARCHAR(40),
    ra_deg FLOAT8,
    dec_j2000_dms VARCHAR(40),
    dec_deg FLOAT8,
    distance_ly FLOAT8,
    distance_pc FLOAT8,
    parallax_mas FLOAT8,
    redshift_z VARCHAR(50),
    apparent_magnitude FLOAT8,
    absolute_magnitude FLOAT8,
    angular_size_major_arcmin FLOAT8,
    angular_size_minor_arcmin FLOAT8,
    discovery_year FLOAT8,
    discoverer VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast Spatial & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_celestial_ra_dec ON celestial_objects(ra_deg, dec_deg);
CREATE INDEX IF NOT EXISTS idx_celestial_type ON celestial_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_celestial_const ON celestial_objects(constellation);
CREATE INDEX IF NOT EXISTS idx_celestial_distance ON celestial_objects(distance_ly);
CREATE INDEX IF NOT EXISTS idx_celestial_mag ON celestial_objects(apparent_magnitude);

-- ==============================================================================
-- 2. STAR SYSTEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS star_systems (
    id VARCHAR(64) PRIMARY KEY,
    system_name VARCHAR(150) NOT NULL,
    multiplicity_type VARCHAR(50) NOT NULL,
    num_stars INT DEFAULT 1,
    hierarchy_notation VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_star_systems_name ON star_systems(system_name);

-- ==============================================================================
-- 3. STARS EXTENSION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS stars (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    star_system_id VARCHAR(64) REFERENCES star_systems(id) ON DELETE SET NULL,
    system_component VARCHAR(20),
    spectral_type VARCHAR(50),
    spectral_class VARCHAR(10),
    luminosity_class VARCHAR(20),
    effective_temp_k FLOAT8,
    mass_solar FLOAT8,
    radius_solar FLOAT8,
    luminosity_solar FLOAT8,
    log_g FLOAT8,
    metallicity_fe_h FLOAT8,
    age_gyr FLOAT8,
    v_rot_km_s FLOAT8,
    pm_ra_mas_yr FLOAT8,
    pm_dec_mas_yr FLOAT8,
    radial_velocity_km_s FLOAT8,
    variable_type VARCHAR(100),
    evolutionary_stage VARCHAR(100),
    num_planets INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stars_system ON stars(star_system_id);
CREATE INDEX IF NOT EXISTS idx_stars_spectral ON stars(spectral_class, spectral_type);
CREATE INDEX IF NOT EXISTS idx_stars_temp ON stars(effective_temp_k);
CREATE INDEX IF NOT EXISTS idx_stars_planets ON stars(num_planets);

-- ==============================================================================
-- 4. PLANETS & EXOPLANETS EXTENSION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS planets_exoplanets (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    host_star_id VARCHAR(64) REFERENCES celestial_objects(id) ON DELETE SET NULL,
    planet_letter VARCHAR(10),
    planet_subtype VARCHAR(100),
    mass_earth FLOAT8,
    mass_jupiter FLOAT8,
    radius_earth FLOAT8,
    radius_jupiter FLOAT8,
    density_g_cm3 FLOAT8,
    surface_gravity_m_s2 FLOAT8,
    escape_velocity_km_s FLOAT8,
    equilibrium_temp_k FLOAT8,
    surface_temp_k FLOAT8,
    atmosphere_notes TEXT,
    has_rings BOOLEAN DEFAULT FALSE,
    moon_count INT DEFAULT 0,
    in_habitable_zone BOOLEAN DEFAULT FALSE,
    esi FLOAT8,
    discovery_method VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_planets_host_star ON planets_exoplanets(host_star_id);
CREATE INDEX IF NOT EXISTS idx_planets_subtype ON planets_exoplanets(planet_subtype);
CREATE INDEX IF NOT EXISTS idx_planets_hz ON planets_exoplanets(in_habitable_zone);
CREATE INDEX IF NOT EXISTS idx_planets_esi ON planets_exoplanets(esi);

-- ==============================================================================
-- 5. ASTROBIOLOGY & HABITABILITY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS astrobiology_habitability (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    planet_name VARCHAR(150),
    host_star VARCHAR(150),
    world_class VARCHAR(100),
    hz_status VARCHAR(100),
    s_eff FLOAT8,
    hz_in_au FLOAT8,
    hz_out_au FLOAT8,
    uv_flux_mw_m2 FLOAT8,
    fx_erg_s_cm2 FLOAT8,
    flare_activity_level VARCHAR(100),
    p_dyn_npa FLOAT8,
    stripping_risk VARCHAR(100),
    is_tidally_locked BOOLEAN DEFAULT FALSE,
    tidal_heating_flux_mw_m2 FLOAT8,
    mag_dipole_moment_rel FLOAT8,
    geodynamic_regime VARCHAR(100),
    scale_height_km FLOAT8,
    tsm FLOAT8,
    esm FLOAT8,
    target_biosignatures TEXT,
    false_positive_risk TEXT,
    surf_liquid_water_to FLOAT8,
    subsurface_ocean_depth_km FLOAT8,
    hydrothermal_salinity_profile TEXT,
    carbonate_silicate_cycle TEXT,
    esi FLOAT8,
    phi FLOAT8,
    bio_potential_score FLOAT8
);

CREATE INDEX IF NOT EXISTS idx_astro_bio_score ON astrobiology_habitability(bio_potential_score);
CREATE INDEX IF NOT EXISTS idx_astro_hz_status ON astrobiology_habitability(hz_status);

-- ==============================================================================
-- 6. INTERSTELLAR & ROGUE OBJECTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS interstellar_and_rogue_objects (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    primary_name VARCHAR(150),
    category VARCHAR(100),
    spectral_type VARCHAR(50),
    mass_val FLOAT8,
    mass_unit VARCHAR(30),
    radius_val FLOAT8,
    radius_unit VARCHAR(30),
    velocity_inf_or_hvs_km_s FLOAT8,
    eccentricity_or_gal_v FLOAT8,
    temperature_k FLOAT8,
    distance_ly FLOAT8,
    constellation VARCHAR(10),
    kinematic_origin TEXT,
    key_astrophysical_phenomenon TEXT,
    discovery_year INT,
    discoverer VARCHAR(255)
);

-- ==============================================================================
-- 7. COMPACT RELICS & GRAVITATIONAL WAVE SOURCES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS compact_relics_and_gw (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    primary_name VARCHAR(150),
    relic_category VARCHAR(100),
    spin_period_s FLOAT8,
    spin_frequency_hz FLOAT8,
    magnetic_field_gauss TEXT,
    mass_solar FLOAT8,
    distance_ly FLOAT8,
    constellation VARCHAR(10),
    associated_remnant VARCHAR(150),
    key_physical_phenomenon TEXT,
    discovery_year INT
);

-- ==============================================================================
-- 8. MOONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS moons (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    parent_planet_id VARCHAR(64) REFERENCES planets_exoplanets(object_id) ON DELETE CASCADE,
    radius_km FLOAT8,
    mass_kg FLOAT8,
    is_tidally_locked BOOLEAN DEFAULT TRUE,
    has_subsurface_ocean BOOLEAN DEFAULT FALSE,
    geological_activity VARCHAR(100),
    atmosphere_type VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_moons_parent ON moons(parent_planet_id);

-- ==============================================================================
-- 9. ORBITAL ELEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orbital_elements (
    id VARCHAR(64) PRIMARY KEY,
    object_id VARCHAR(64) NOT NULL REFERENCES celestial_objects(id) ON DELETE CASCADE,
    parent_object_id VARCHAR(64) REFERENCES celestial_objects(id) ON DELETE SET NULL,
    semi_major_axis_au FLOAT8,
    orbital_period_days FLOAT8,
    orbital_period_years FLOAT8,
    eccentricity FLOAT8,
    inclination_deg FLOAT8,
    periapsis_au FLOAT8,
    apoapsis_au FLOAT8,
    argument_of_periapsis_deg FLOAT8,
    longitude_ascending_node_deg FLOAT8,
    mean_anomaly_deg FLOAT8,
    epoch_jd FLOAT8,
    orbital_speed_km_s FLOAT8
);

CREATE INDEX IF NOT EXISTS idx_orbital_obj ON orbital_elements(object_id);
CREATE INDEX IF NOT EXISTS idx_orbital_parent ON orbital_elements(parent_object_id);

-- ==============================================================================
-- 10. TRANSITS & ASTROMETRIC EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS transits_and_events (
    id VARCHAR(64) PRIMARY KEY,
    object_id VARCHAR(64) NOT NULL REFERENCES celestial_objects(id) ON DELETE CASCADE,
    target_star_id VARCHAR(64) REFERENCES celestial_objects(id) ON DELETE SET NULL,
    transit_epoch_bjd FLOAT8,
    period_days FLOAT8,
    duration_hours FLOAT8,
    ingress_duration_min FLOAT8,
    transit_depth_percent FLOAT8,
    impact_parameter FLOAT8,
    sky_projected_obliquity_deg FLOAT8,
    secondary_eclipse_depth_ppm FLOAT8
);

CREATE INDEX IF NOT EXISTS idx_transits_obj ON transits_and_events(object_id);
CREATE INDEX IF NOT EXISTS idx_transits_star ON transits_and_events(target_star_id);

-- ==============================================================================
-- 11. GALAXIES EXTENSION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS galaxies (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    hubble_type VARCHAR(50),
    galaxy_category VARCHAR(100),
    total_mass_solar FLOAT8,
    stellar_mass_solar FLOAT8,
    diameter_kpc FLOAT8,
    star_formation_rate_solar_yr FLOAT8,
    smbh_mass_solar FLOAT8,
    agn_type VARCHAR(100),
    galaxy_group_cluster VARCHAR(150),
    is_interacting BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_galaxies_type ON galaxies(hubble_type);

-- ==============================================================================
-- 12. DEEP SKY OBJECTS TABLE (Nebulae, Clusters, Messier)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS deep_sky_objects (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    dso_type VARCHAR(100) NOT NULL,
    central_star_id VARCHAR(64) REFERENCES celestial_objects(id) ON DELETE SET NULL,
    cluster_star_count FLOAT8,
    cluster_class VARCHAR(50),
    surface_brightness FLOAT8,
    emission_lines VARCHAR(150),
    expansion_vel_km_s FLOAT8
);

CREATE INDEX IF NOT EXISTS idx_dso_type ON deep_sky_objects(dso_type);

-- ==============================================================================
-- 13. MOLECULAR CLOUDS & DARK NEBULAE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS molecular_clouds_dark_nebulae (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    cloud_name VARCHAR(150),
    cloud_type VARCHAR(100),
    constellation VARCHAR(10),
    distance_ly FLOAT8,
    mass_solar FLOAT8,
    dimensions_pc VARCHAR(100),
    core_temp_k FLOAT8,
    extinction_av_mag FLOAT8,
    primary_tracers TEXT,
    collapse_star_formation_status TEXT
);

-- ==============================================================================
-- 14. SUPERNOVA REMNANTS & PLANETARY NEBULAE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS supernova_remnants_pne (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    nebula_name VARCHAR(150),
    nebula_type VARCHAR(100),
    constellation VARCHAR(10),
    distance_ly FLOAT8,
    diameter_ly FLOAT8,
    age_years INT,
    central_engine_star VARCHAR(150),
    shock_or_exp_velocity_km_s FLOAT8,
    chemical_enrichments TEXT,
    astrophysical_notes TEXT
);

-- ==============================================================================
-- 15. MINOR BODIES TABLE (Asteroids, Comets, Trans-Neptunian)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS minor_bodies (
    object_id VARCHAR(64) PRIMARY KEY REFERENCES celestial_objects(id) ON DELETE CASCADE,
    minor_body_type VARCHAR(100),
    diameter_km FLOAT8,
    albedo FLOAT8,
    spectral_tax_class VARCHAR(50),
    rotation_period_hours FLOAT8,
    comet_type VARCHAR(100),
    next_perihelion_date VARCHAR(50)
);

-- ==============================================================================
-- 16. CATALOG CROSS REFERENCES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS catalog_cross_references (
    id SERIAL PRIMARY KEY,
    object_id VARCHAR(64) NOT NULL REFERENCES celestial_objects(id) ON DELETE CASCADE,
    catalog_name VARCHAR(100) NOT NULL,
    designation VARCHAR(150) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crossref_obj ON catalog_cross_references(object_id);
CREATE INDEX IF NOT EXISTS idx_crossref_cat_desig ON catalog_cross_references(catalog_name, designation);

-- ==============================================================================
-- 17. PGVECTOR SEMANTIC EMBEDDINGS (For AI Agent Knowledge Retrieval)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS celestial_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id VARCHAR(64) REFERENCES celestial_objects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content_chunk TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536), -- OpenAI text-embedding-3-small / ada-002 dimensions
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Index for vector cosine similarity queries
CREATE INDEX IF NOT EXISTS idx_celestial_embeddings_hnsw 
ON celestial_embeddings USING hnsw (embedding vector_cosine_ops);

-- ==============================================================================
-- 18. RPC FUNCTIONS FOR HYBRID & SEMANTIC SEARCH
-- ==============================================================================

-- Vector Cosine Similarity Search RPC
CREATE OR REPLACE FUNCTION match_celestial_objects (
    query_embedding vector(1536),
    match_threshold FLOAT8 DEFAULT 0.25,
    match_count INT DEFAULT 10,
    filter_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    object_id VARCHAR(64),
    title VARCHAR(255),
    category VARCHAR(100),
    content_chunk TEXT,
    metadata JSONB,
    similarity FLOAT8
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ce.id,
        ce.object_id,
        ce.title,
        ce.category,
        ce.content_chunk,
        ce.metadata,
        1 - (ce.embedding <=> query_embedding) AS similarity
    FROM celestial_embeddings ce
    WHERE (filter_category IS NULL OR ce.category = filter_category)
      AND (1 - (ce.embedding <=> query_embedding)) >= match_threshold
    ORDER BY ce.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Secure Safe Read-Only SQL Query RPC for AI Agents
CREATE OR REPLACE FUNCTION execute_astro_sql (
    query_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_query TEXT;
    result_json JSONB;
BEGIN
    clean_query := TRIM(query_text);
    
    -- Ensure query is read-only (starts with SELECT)
    IF NOT (clean_query ~* '^\s*SELECT\s+') THEN
        RAISE EXCEPTION 'Only SELECT queries are permitted for AI agent tools.';
    END IF;

    -- Block dangerous keywords
    IF clean_query ~* '(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|CREATE|VACUUM)' THEN
        RAISE EXCEPTION 'Mutating or DDL operations are blocked.';
    END IF;

    -- Execute query as JSON
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || clean_query || ') t'
    INTO result_json;

    RETURN result_json;
END;
$$;

-- ==============================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE celestial_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE planets_exoplanets ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrobiology_habitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE interstellar_and_rogue_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE compact_relics_and_gw ENABLE ROW LEVEL SECURITY;
ALTER TABLE moons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orbital_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transits_and_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE galaxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_sky_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE molecular_clouds_dark_nebulae ENABLE ROW LEVEL SECURITY;
ALTER TABLE supernova_remnants_pne ENABLE ROW LEVEL SECURITY;
ALTER TABLE minor_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE celestial_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for All Tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'celestial_objects', 'star_systems', 'stars', 'planets_exoplanets',
        'astrobiology_habitability', 'interstellar_and_rogue_objects', 'compact_relics_and_gw',
        'moons', 'orbital_elements', 'transits_and_events', 'galaxies',
        'deep_sky_objects', 'molecular_clouds_dark_nebulae', 'supernova_remnants_pne',
        'minor_bodies', 'catalog_cross_references', 'celestial_embeddings'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read" ON %I;', t);
        EXECUTE format('CREATE POLICY "Allow public read" ON %I FOR SELECT USING (true);', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow service role full access" ON %I;', t);
        EXECUTE format('CREATE POLICY "Allow service role full access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;
