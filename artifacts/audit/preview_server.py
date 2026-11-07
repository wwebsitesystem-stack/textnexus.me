import http.server
import os
import socketserver
import sys


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "dist"))

    class Handler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self) -> None:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

        def log_message(self, fmt: str, *args: object) -> None:
            sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))

    class Server(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    with Server(("0.0.0.0", port), Handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
