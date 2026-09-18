const GuestPrefs = {
  storageKey: "solara_prefs",
  defaults: { theme: "light", lang: "en" },

  read() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return { ...this.defaults, ...(raw ? JSON.parse(raw) : {}) };
    } catch {
      return { ...this.defaults };
    }
  },

  write(partial) {
    const next = { ...this.read(), ...partial };
    localStorage.setItem(this.storageKey, JSON.stringify(next));
    this.apply(next);
    return next;
  },

  getTheme() {
    return this.read().theme === "dark" ? "dark" : "light";
  },

  setTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    this.write({ theme: value });
    this.syncThemeToggle();
    return value;
  },

  toggleTheme() {
    return this.setTheme(this.getTheme() === "dark" ? "light" : "dark");
  },

  getLang() {
    const lang = this.read().lang;
    return lang === "km" ? "km" : "en";
  },

  setLang(lang) {
    const value = lang === "km" ? "km" : "en";
    this.write({ lang: value });
    this.syncLangToggle();
    const session = typeof Store !== "undefined" ? Store.session() : null;
    if (session) {
      const user = Store.findUserById(session.id);
      if (user) {
        Store.updateUser(user.id, {
          settings: { ...user.settings, language: value }
        });
      }
    }
    return value;
  },

  apply(prefs) {
    const theme = prefs.theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.body?.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.lang = prefs.lang === "km" ? "km" : "en";
  },

  init() {
    const prefs = this.read();
    const session = typeof Store !== "undefined" ? Store.session() : null;
    if (session) {
      const user = Store.findUserById(session.id);
      const fromProfile = user?.settings?.language;
      if ((fromProfile === "en" || fromProfile === "km") && !localStorage.getItem(this.storageKey)) {
        prefs.lang = fromProfile;
      }
    }
    this.apply(prefs);
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(prefs));
    }
    this.syncThemeToggle();
    this.syncLangToggle();
  },

  syncThemeToggle() {
    const btn = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    if (!btn || !icon) return;
    const dark = this.getTheme() === "dark";
    icon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    btn.setAttribute(
      "aria-label",
      typeof I18n !== "undefined"
        ? I18n.t(dark ? "prefs.themeLight" : "prefs.themeDark")
        : dark
          ? "Switch to light mode"
          : "Switch to dark mode"
    );
  },

  syncLangToggle() {
    const flag = document.getElementById("langFlag");
    const code = document.getElementById("langCode");
    const lang = this.getLang();
    const meta =
      typeof I18n !== "undefined"
        ? I18n.langMeta(lang)
        : { flagSrc: "images/national_flag_U.K.jpg", flagAlt: "United Kingdom flag", code: "EN" };
    if (flag) {
      flag.src = meta.flagSrc;
      flag.alt = meta.flagAlt;
    }
    if (code) code.textContent = meta.code;
    document.querySelectorAll(".lang-menu button[data-lang]").forEach((el) => {
      el.classList.toggle("active", el.dataset.lang === lang);
    });
  }
};
