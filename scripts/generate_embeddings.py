"""
AstroDB: Vector Embedding Generation Pipeline
Creates dense 1536-dimensional semantic embeddings for all celestial objects, exoplanets,
and cosmic relics using OpenAI (text-embedding-3-small) and saves them into Supabase pgvector.
"""

import os
import sys
import sqlite3
import json
import time
from typing import List, Dict, Any

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "..", "00 - Master Relational Database (SQLite).sqlite")
OUTPUT_SQL_EMBEDDINGS = os.path.join(os.path.dirname(__file__), "..", "supabase_embeddings_seed.sql")

def build_object_document(conn: sqlite3.Connection, obj: sqlite3.Row) -> Dict[str, Any]:
    """
    Synthesize rich astrophysical context for semantic search
    """
    obj_id = obj["id"]
    cursor = conn.cursor()

    parts = [
        f"Object Name: {obj['primary_name']}",
        f"Object Type: {obj['object_type']}",
        f"Constellation: {obj['constellation'] or 'N/A'}",
        f"Distance: {obj['distance_ly']} light years ({obj['distance_pc']} pc)" if obj['distance_ly'] else "",
        f"Coordinates: RA {obj['ra_j2000_hms']} ({obj['ra_deg']} deg), Dec {obj['dec_j2000_dms']} ({obj['dec_deg']} deg)" if obj['ra_deg'] is not None else "",
        f"Apparent Magnitude: {obj['apparent_magnitude']}, Absolute Magnitude: {obj['absolute_magnitude']}" if obj['apparent_magnitude'] is not None else "",
        f"Discovered: {int(obj['discovery_year'])} by {obj['discoverer']}" if obj['discovery_year'] else ""
    ]

    category = obj["object_type"]

    # Star metadata
    cursor.execute("SELECT * FROM stars WHERE object_id = ?", (obj_id,))
    star = cursor.fetchone()
    if star:
        category = "Star"
        parts.append(
            f"Star Details: Spectral Type {star['spectral_type']} ({star['spectral_class']}{star['luminosity_class'] or ''}), "
            f"Temperature {star['effective_temp_k']} K, Mass {star['mass_solar']} Solar, Radius {star['radius_solar']} Solar, "
            f"Luminosity {star['luminosity_solar']} Solar, Metallicity [Fe/H] {star['metallicity_fe_h']}, "
            f"Evolutionary Stage: {star['evolutionary_stage'] or 'Main Sequence'}, Number of Planets: {star['num_planets']}"
        )

    # Exoplanet metadata
    cursor.execute("SELECT * FROM planets_exoplanets WHERE object_id = ?", (obj_id,))
    planet = cursor.fetchone()
    if planet:
        category = "Exoplanet"
        parts.append(
            f"Exoplanet Details: Subtype {planet['planet_subtype']}, Mass {planet['mass_earth']} Earth Masses ({planet['mass_jupiter']} Jupiter Masses), "
            f"Radius {planet['radius_earth']} Earth Radii ({planet['radius_jupiter']} Jupiter Radii), Density {planet['density_g_cm3']} g/cm³, "
            f"Surface Gravity {planet['surface_gravity_m_s2']} m/s², Equilibrium Temp {planet['equilibrium_temp_k']} K, "
            f"Habitable Zone: {'Yes' if planet['in_habitable_zone'] else 'No'}, Earth Similarity Index (ESI): {planet['esi']}, "
            f"Discovery Method: {planet['discovery_method']}. Notes: {planet['atmosphere_notes'] or 'None'}"
        )

    # Astrobiology metadata
    cursor.execute("SELECT * FROM astrobiology_habitability WHERE object_id = ?", (obj_id,))
    astro = cursor.fetchone()
    if astro:
        parts.append(
            f"Astrobiology & Habitability: Status: {astro['hz_status']}, World Class: {astro['world_class']}, "
            f"Bio Potential Score: {astro['bio_potential_score']}, ESI: {astro['esi']}, PHI: {astro['phi']}, "
            f"Tidally Locked: {'Yes' if astro['is_tidally_locked'] else 'No'}, Target Biosignatures: {astro['target_biosignatures']}, "
            f"Subsurface Ocean: {astro['subsurface_ocean_depth_km']} km depth, Geodynamic: {astro['geodynamic_regime']}"
        )

    # Interstellar / Rogue
    cursor.execute("SELECT * FROM interstellar_and_rogue_objects WHERE object_id = ?", (obj_id,))
    rogue = cursor.fetchone()
    if rogue:
        category = "Interstellar / Rogue Object"
        parts.append(
            f"Interstellar Phenomena: Category {rogue['category']}, Velocity {rogue['velocity_inf_or_hvs_km_s']} km/s, "
            f"Origin: {rogue['kinematic_origin']}, Astrophysical Phenomenon: {rogue['key_astrophysical_phenomenon']}"
        )

    # Compact Relic
    cursor.execute("SELECT * FROM compact_relics_and_gw WHERE object_id = ?", (obj_id,))
    relic = cursor.fetchone()
    if relic:
        category = "Compact Relic / GW Source"
        parts.append(
            f"Compact Relic: Category {relic['relic_category']}, Spin Period {relic['spin_period_s']} s, "
            f"Magnetic Field {relic['magnetic_field_gauss']} Gauss, Remnant: {relic['associated_remnant']}, "
            f"Physics: {relic['key_physical_phenomenon']}"
        )

    # Galaxy metadata
    cursor.execute("SELECT * FROM galaxies WHERE object_id = ?", (obj_id,))
    gal = cursor.fetchone()
    if gal:
        category = "Galaxy"
        parts.append(
            f"Galaxy Details: Hubble Type {gal['hubble_type']}, Category {gal['galaxy_category']}, "
            f"Total Mass {gal['total_mass_solar']} Solar, Diameter {gal['diameter_kpc']} kpc, "
            f"Star Formation Rate {gal['star_formation_rate_solar_yr']} M_sun/yr, SMBH Mass {gal['smbh_mass_solar']} Solar, "
            f"AGN Type: {gal['agn_type'] or 'None'}, Interacting: {'Yes' if gal['is_interacting'] else 'No'}"
        )

    # Cross references
    cursor.execute("SELECT catalog_name, designation FROM catalog_cross_references WHERE object_id = ?", (obj_id,))
    xrefs = cursor.fetchall()
    if xrefs:
        desigs = [f"{x['catalog_name']}: {x['designation']}" for x in xrefs]
        parts.append(f"Catalog Cross References: {', '.join(desigs)}")

    content = "\n".join([p for p in parts if p.strip()])

    return {
        "object_id": obj_id,
        "title": obj["primary_name"],
        "category": category,
        "content_chunk": content,
        "metadata": {
            "primary_name": obj["primary_name"],
            "object_type": obj["object_type"],
            "constellation": obj["constellation"],
            "distance_ly": obj["distance_ly"],
            "apparent_magnitude": obj["apparent_magnitude"],
            "ra_deg": obj["ra_deg"],
            "dec_deg": obj["dec_deg"]
        }
    }

def generate_embeddings_batch(texts: List[str], api_key: str) -> List[List[float]]:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        response = client.embeddings.create(
            input=texts,
            model="text-embedding-3-small"
        )
        return [item.embedding for item in response.data]
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return []

def run_embeddings_pipeline():
    api_key = os.environ.get("OPENAI_API_KEY")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM celestial_objects")
    all_objects = cursor.fetchall()
    print(f"Found {len(all_objects)} celestial objects for embedding generation.")

    documents = []
    for obj in all_objects:
        doc = build_object_document(conn, obj)
        documents.append(doc)

    print(f"Built {len(documents)} contextual knowledge documents.")

    if not api_key:
        print("\n[INFO] OPENAI_API_KEY is not set.")
        print("To generate embeddings and push to Supabase:")
        print("  1. Set OPENAI_API_KEY in your environment")
        print("  2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("  3. Run: python scripts/generate_embeddings.py")
        
        # Save sample documents to JSON for local testbench inspection
        sample_path = os.path.join(os.path.dirname(__file__), "..", "celestial_knowledge_docs.json")
        with open(sample_path, "w", encoding="utf-8") as f:
            json.dump(documents[:100], f, indent=2)
        print(f"Saved 100 sample documents to {sample_path}")
        return

    print("Generating embeddings via OpenAI text-embedding-3-small in batches of 100...")
    batch_size = 100
    all_embeddings = []
    for i in range(0, len(documents), batch_size):
        chunk = documents[i:i + batch_size]
        texts = [d["content_chunk"] for d in chunk]
        print(f"Embedding batch {i // batch_size + 1} / {(len(documents) + batch_size - 1) // batch_size}...")
        embeddings = generate_embeddings_batch(texts, api_key)
        if len(embeddings) != len(chunk):
            print(f"Failed to generate embeddings for batch {i}")
            break
        for doc, emb in zip(chunk, embeddings):
            doc["embedding"] = emb
            all_embeddings.append(doc)
        time.sleep(0.5)

    if supabase_url and supabase_service_key:
        try:
            from supabase import create_client
            supabase = create_client(supabase_url, supabase_service_key)
            print(f"Pushing {len(all_embeddings)} vector records to Supabase celestial_embeddings table...")
            for i in range(0, len(all_embeddings), 100):
                sub_chunk = all_embeddings[i:i + 100]
                rows = [{
                    "object_id": d["object_id"],
                    "title": d["title"],
                    "category": d["category"],
                    "content_chunk": d["content_chunk"],
                    "metadata": d["metadata"],
                    "embedding": d["embedding"]
                } for d in sub_chunk]
                supabase.table("celestial_embeddings").upsert(rows).execute()
            print("[SUCCESS] All embeddings successfully stored in Supabase pgvector!")
        except Exception as e:
            print(f"Error pushing to Supabase: {e}")

if __name__ == "__main__":
    run_embeddings_pipeline()
