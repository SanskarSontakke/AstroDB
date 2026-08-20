"""
AstroDB Python Client for AI Agents & Astronomical Data Ingestion
"""

import os
import requests
from typing import Dict, Any, List, Optional

class AstroDBClient:
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = (base_url or os.environ.get("ASTRODB_API_URL") or "http://localhost:3000").rstrip("/")
        self.api_key = api_key or os.environ.get("ASTRODB_API_KEY")
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({
                "x-api-key": self.api_key,
                "Authorization": f"Bearer {self.api_key}"
            })

    def search(self, query: str, object_type: Optional[str] = None, constellation: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Hybrid semantic & structured astronomical search
        """
        params = {"q": query, "limit": limit}
        if object_type:
            params["type"] = object_type
        if constellation:
            params["constellation"] = constellation

        resp = self.session.get(f"{self.base_url}/api/v1/search", params=params)
        resp.raise_for_status()
        data = resp.json()
        return data.get("results") or data.get("data") or []

    def get_object(self, object_id_or_name: str) -> Dict[str, Any]:
        """
        Retrieve complete multi-catalog relational dossier for an object
        """
        resp = self.session.get(f"{self.base_url}/api/v1/objects/{object_id_or_name}")
        resp.raise_for_status()
        return resp.json()

    def get_system(self, system_id_or_name: str) -> Dict[str, Any]:
        """
        Retrieve star system architecture (stars + orbiting exoplanets)
        """
        resp = self.session.get(f"{self.base_url}/api/v1/systems/{system_id_or_name}")
        resp.raise_for_status()
        return resp.json()

    def query_catalog(self, catalog_type: str, in_habitable_zone: bool = False, min_esi: Optional[float] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Query specialized sub-catalogs (exoplanets, stars, astrobiology, galaxies, relics)
        """
        params = {"limit": limit}
        if in_habitable_zone:
            params["in_habitable_zone"] = "true"
        if min_esi is not None:
            params["min_esi"] = min_esi

        resp = self.session.get(f"{self.base_url}/api/v1/catalogs/{catalog_type}", params=params)
        resp.raise_for_status()
        return resp.json().get("data", [])

    def query_sql(self, select_query: str) -> List[Dict[str, Any]]:
        """
        Execute safe read-only SQL query against the AstroDB sandbox
        """
        resp = self.session.post(f"{self.base_url}/api/v1/query", json={"query": select_query})
        resp.raise_for_status()
        return resp.json().get("data", [])

    def get_tools_schema(self) -> Dict[str, Any]:
        """
        Get JSON tool definitions for OpenAI Function Calling & LangChain
        """
        resp = self.session.get(f"{self.base_url}/api/v1/tools")
        resp.raise_for_status()
        return resp.json()
