(function () {
  try {
    var raw = localStorage.getItem("solara_prefs");
    if (!raw) return;
    var prefs = JSON.parse(raw);
    if (prefs.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    if (prefs.lang === "km") {
      document.documentElement.setAttribute("lang", "km");
    }
  } catch (_) {
    /* ignore */
  }
})();
