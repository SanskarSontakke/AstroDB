"""
AstroDB: SQLite to Supabase / PostgreSQL Data Migration Pipeline
Exports all 16 relational astronomical tables from SQLite and ingests them into Supabase
either via direct PostgreSQL connection, Supabase REST Client, or standalone SQL dump.
"""

import os
import sys
import sqlite3
import json
import math
from typing import Any, Dict, List

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "..", "00 - Master Relational Database (SQLite).sqlite")
OUTPUT_SQL_PATH = os.path.join(os.path.dirname(__file__), "..", "supabase_seed_data.sql")

# Tables in strict dependency order for referential integrity
TABLES_ORDER = [
    "celestial_objects",
    "star_systems",
    "stars",
    "planets_exoplanets",
    "astrobiology_habitability",
    "interstellar_and_rogue_objects",
    "compact_relics_and_gw",
    "moons",
    "orbital_elements",
    "transits_and_events",
    "galaxies",
    "deep_sky_objects",
    "molecular_clouds_dark_nebulae",
    "supernova_remnants_pne",
    "minor_bodies",
    "catalog_cross_references"
]

BOOLEAN_COLUMNS = {
    "planets_exoplanets": ["has_rings", "in_habitable_zone"],
    "astrobiology_habitability": ["is_tidally_locked"],
    "moons": ["is_tidally_locked", "has_subsurface_ocean"],
    "galaxies": ["is_interacting"]
}

def clean_val(val: Any, is_bool: bool = False) -> str:
    if val is None:
        return "NULL"
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return "NULL"
        return str(val)
    if is_bool:
        if isinstance(val, (int, float)):
            return "TRUE" if val == 1 else "FALSE"
        if isinstance(val, str):
            v_lower = val.strip().lower()
            if v_lower in ("true", "1", "yes", "t"):
                return "TRUE"
            if v_lower in ("false", "0", "no", "f"):
                return "FALSE"
            return "NULL"
        return "TRUE" if bool(val) else "FALSE"
    if isinstance(val, (int,)):
        return str(val)
    # String cleaning & escaping single quotes
    s = str(val).replace("'", "''")
    return f"'{s}'"

def generate_sql_seed_dump():
    print(f"Connecting to SQLite database: {SQLITE_PATH}")
    if not os.path.exists(SQLITE_PATH):
        raise FileNotFoundError(f"SQLite database not found at {SQLITE_PATH}")

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    total_rows = 0

    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as out:
        out.write("-- ==============================================================================\n")
        out.write("-- AstroDB Seed Data: Generated from Master Relational Database\n")
        out.write("-- ==============================================================================\n\n")
        out.write("SET statement_timeout = 0;\n")
        out.write("SET client_encoding = 'UTF8';\n\n")

        for table in TABLES_ORDER:
            cursor.execute(f"SELECT * FROM \"{table}\"")
            rows = cursor.fetchall()
            if not rows:
                print(f"[-] Table {table}: 0 rows (skipping)")
                continue

            columns = [desc[0] for desc in cursor.description]
            bool_cols = set(BOOLEAN_COLUMNS.get(table, []))

            print(f"[+] Processing {table}: {len(rows)} records...")
            total_rows += len(rows)

            out.write(f"-- Table: {table} ({len(rows)} rows)\n")
            
            # Batch inserts in chunks of 500
            batch_size = 500
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i + batch_size]
                cols_str = ", ".join([f'"{c}"' for c in columns])
                out.write(f'INSERT INTO "{table}" ({cols_str}) VALUES\n')

                values_list = []
                for row in batch:
                    val_strs = []
                    for col in columns:
                        val = row[col]
                        is_b = col in bool_cols
                        val_strs.append(clean_val(val, is_bool=is_b))
                    values_list.append(f"  ({', '.join(val_strs)})")

                out.write(",\n".join(values_list))
                out.write("\nON CONFLICT DO NOTHING;\n\n")

    conn.close()
    print(f"\n[SUCCESS] Successfully generated SQL seed file: {OUTPUT_SQL_PATH}")
    print(f"Total exported rows: {total_rows}")

def migrate_to_supabase_direct(supabase_url: str, supabase_key: str):
    """
    Directly push batches to Supabase PostgREST API using requests / httpx
    """
    try:
        from supabase import create_client, Client
    except ImportError:
        print("supabase-py not installed. Run: pip install supabase")
        return

    print(f"Initializing Supabase client with {supabase_url}...")
    supabase: Client = create_client(supabase_url, supabase_key)
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    for table in TABLES_ORDER:
        cursor.execute(f"SELECT * FROM \"{table}\"")
        rows = cursor.fetchall()
        if not rows:
            continue

        columns = [desc[0] for desc in cursor.description]
        bool_cols = set(BOOLEAN_COLUMNS.get(table, []))

        data = []
        for r in rows:
            item = {}
            for c in columns:
                val = r[c]
                if val is not None and isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                    val = None
                if c in bool_cols and val is not None:
                    val = bool(val)
                item[c] = val
            data.append(item)

        print(f"Upserting {len(data)} records into {table}...")
        batch_size = 250
        for i in range(0, len(data), batch_size):
            chunk = data[i:i + batch_size]
            try:
                supabase.table(table).upsert(chunk).execute()
            except Exception as e:
                print(f"Error upserting batch to {table}: {e}")

    conn.close()
    print("Direct Supabase migration completed.")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        url = sys.argv[1]
        key = sys.argv[2]
        migrate_to_supabase_direct(url, key)
    else:
        generate_sql_seed_dump()
