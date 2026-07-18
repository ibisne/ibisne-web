from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import sys
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8793
ThreadingHTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()
