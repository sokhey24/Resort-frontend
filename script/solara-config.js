/**
 * API base URL for the guest site.
 *
 * Priority:
 * 1. window.SOLARA_API_BASE set before this script
 * 2. <meta name="solara-api-base" content="https://your-api.example/api">
 * 3. localhost default (development)
 */
(function () {
  if (!window.SOLARA_API_BASE) {
    var meta = document.querySelector('meta[name="solara-api-base"]');
    var fromMeta = meta && meta.content ? String(meta.content).trim() : "";
    if (fromMeta) {
      window.SOLARA_API_BASE = fromMeta.replace(/\/+$/, "");
    }
  }
  if (!window.SOLARA_API_BASE) {
    window.SOLARA_API_BASE = "http://127.0.0.1:8000/api";
  }
  window.__SOLARA_API_MODE = window.SOLARA_API_MODE || "auto";
  window.__SOLARA_FILE_PROTOCOL = location.protocol === "file:";
})();
