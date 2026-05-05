from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import socket
from urllib.parse import urlparse


HOST = "0.0.0.0"
PORT = 8000
MAX_REQUEST_BYTES = 4096


def get_lan_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except OSError:
        return "localhost"


class RadioHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/youtube-audio":
            self.send_error(404, "Not found")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length > MAX_REQUEST_BYTES:
                self.send_json({"error": "Request body is too large."}, status=413)
                return
            payload = json.loads(self.rfile.read(content_length) or b"{}")
            youtube_url = payload.get("url", "").strip()
        except (ValueError, json.JSONDecodeError):
            self.send_json({"error": "Invalid request body."}, status=400)
            return

        if not youtube_url:
            self.send_json({"error": "YouTube URL is required."}, status=400)
            return

        if not self.is_youtube_url(youtube_url):
            self.send_json({"error": "Only YouTube URLs are supported."}, status=400)
            return

        try:
            import yt_dlp
        except ImportError:
            self.send_json(
                {"error": "yt-dlp is not installed. Run: pip install -r requirements.txt"},
                status=500,
            )
            return

        ydl_options = {
            "format": "bestaudio/best",
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_options) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                audio_url = info.get("url")

                if not audio_url and info.get("formats"):
                    audio_formats = [
                        item
                        for item in info["formats"]
                        if item.get("url") and item.get("acodec") != "none"
                    ]
                    if audio_formats:
                        audio_url = audio_formats[-1]["url"]

                if not audio_url:
                    self.send_json({"error": "Could not find an audio stream."}, status=500)
                    return

                self.send_json(
                    {
                        "audioUrl": audio_url,
                        "title": info.get("title") or "YouTube Audio",
                        "duration": info.get("duration"),
                    }
                )
        except Exception as error:
            self.send_json({"error": str(error)}, status=500)

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def is_youtube_url(self, url):
        try:
            hostname = urlparse(url).hostname or ""
        except ValueError:
            return False

        hostname = hostname.lower()
        return hostname == "youtu.be" or hostname.endswith(".youtube.com") or hostname == "youtube.com"


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), RadioHandler)
    lan_ip = get_lan_ip()
    print(f"Radio server running locally at http://127.0.0.1:{PORT}")
    print(f"Open on your phone at http://{lan_ip}:{PORT}")
    print("Your phone and computer must be on the same Wi-Fi.")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
