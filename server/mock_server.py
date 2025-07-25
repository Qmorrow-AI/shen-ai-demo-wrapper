#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/shenai/measurements":
            self.send_error(404); return
        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON"); return
        print("\n=== Shen-AI measurement received ===\n" + json.dumps(payload, indent=2) + "\n", flush=True)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")

    def log_message(self, *args):
        pass  # silence default logging

print(f"Mock Shen-AI server listening on http://0.0.0.0:{PORT}\nCtrl+C to stop.")
HTTPServer(("", PORT), Handler).serve_forever() 