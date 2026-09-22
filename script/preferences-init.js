(function () {
  try {
    if (!window.SOLARA_API_BASE) {
      var apiMeta = document.querySelector('meta[name="solara-api-base"]');
      var apiBase = apiMeta && apiMeta.content ? String(apiMeta.content).trim() : "";
      if (apiBase) {
        window.SOLARA_API_BASE = apiBase.replace(/\/+$/, "");
      }
    }
    var root = document.documentElement;
    var raw = localStorage.getItem("solara_prefs");
    var prefs = raw ? JSON.parse(raw) : null;
    var theme = prefs && prefs.theme === "dark" ? "dark" : "light";
    if (!prefs && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
    root.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.body && document.body.classList.add("theme-dark");
    }
    var lang = prefs && (prefs.lang === "km" || prefs.lang === "KH") ? "km" : "en";
    if (prefs && prefs.lang) {
      root.lang = lang;
    }
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "color-scheme");
      document.head && document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme === "dark" ? "dark light" : "light dark");
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
