(function () {
  try {
    var raw = localStorage.getItem("solara_prefs");
    if (!raw) return;
    var prefs = JSON.parse(raw);
    if (prefs.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    if (prefs.lang === "KH") {
      document.documentElement.setAttribute("lang", "KH");
    }
  } catch (_) {
    /* ignore */
  }
})();
