import http.server, socketserver, os, sys

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        super().end_headers()
    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()
    def log_message(self, *a):
        pass

os.chdir('dist')
socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('0.0.0.0', 3000), H) as httpd:
    httpd.serve_forever()
