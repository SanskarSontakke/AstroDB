"""
AstroDB MCP Stdio Bridge Server for Claude Desktop & Cursor
Relays JSON-RPC MCP requests over standard I/O to the AstroDB HTTP endpoint.
"""

import sys
import json
import os
import requests

API_URL = os.environ.get("ASTRODB_API_URL", "http://localhost:3000/api/mcp")
API_KEY = os.environ.get("ASTRODB_API_KEY", "")

def forward_mcp_request(payload: dict) -> dict:
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["x-api-key"] = API_KEY
        headers["Authorization"] = f"Bearer {API_KEY}"

    try:
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=30)
        return resp.json()
    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": payload.get("id"),
            "error": {"code": -32000, "message": str(e)}
        }

def main():
    # Process line-by-line JSON-RPC messages from stdin
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            res = forward_mcp_request(req)
            sys.stdout.write(json.dumps(res) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_res = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {str(e)}"}
            }
            sys.stdout.write(json.dumps(err_res) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
