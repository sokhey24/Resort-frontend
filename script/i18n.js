const I18n = {
  lang: "en",

  meta: {
    en: {
      flagSrc: "images/national_flag_U.K.jpg",
      flagAlt: "United Kingdom flag",
      code: "EN",
      label: "English"
    },
    km: {
      flagSrc: "images/national_flag_khmer.jpg",
      flagAlt: "Cambodia flag",
      code: "KM",
      label: "ភាសាខ្មែរ"
    }
  },

  strings: {
    en: {
      "nav.home": "Home",
      "nav.rooms": "Rooms",
      "nav.service": "Service",
      "nav.activity": "Activity",
      "nav.dining": "Dining",
      "nav.gallery": "Gallery",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.profile": "Profile",
      "nav.bookings": "My bookings",
      "nav.notifications": "Notifications",
      "nav.settings": "Settings",
      "nav.logout": "Logout",
      "prefs.themeDark": "Switch to dark mode",
      "prefs.themeLight": "Switch to light mode",
      "prefs.language": "Language",
      "footer.touch": "Get in touch",
      "footer.submit": "Submit now",
      "footer.contact": "Contact",
      "footer.quick": "Quick links",
      "footer.stay": "Stay in touch",
      "footer.share": "Share this page",
      "footer.accept": "We accept"
    },
    km: {
      "nav.home": "ទំព័រដើម",
      "nav.rooms": "បន្ទប់",
      "nav.service": "សេវាកម្ម",
      "nav.activity": "សកម្មភាព",
      "nav.dining": "អាហារ",
      "nav.gallery": "វិចិត្រសាល",
      "nav.about": "អំពីយើង",
      "nav.contact": "ទំនាក់ទំនង",
      "nav.login": "ចូល",
      "nav.register": "ចុះឈ្មោះ",
      "nav.profile": "ប្រវត្តិរូប",
      "nav.bookings": "ការកក់របស់ខ្ញុំ",
      "nav.notifications": "ការជូនដំណឹង",
      "nav.settings": "ការកំណត់",
      "nav.logout": "ចាកចេញ",
      "prefs.themeDark": "ប្តូរទៅរបៀបងងឹត",
      "prefs.themeLight": "ប្តូរទៅរបៀបភ្លឺ",
      "prefs.language": "ភាសា",
      "footer.touch": "ទាក់ទងមកយើង",
      "footer.submit": "ផ្ញើឥឡូវ",
      "footer.contact": "ទំនាក់ទំនង",
      "footer.quick": "តំណភ្ជាប់រហ័ស",
      "footer.stay": "តាមដានយើង",
      "footer.share": "ចែករំលែកទំព័រនេះ",
      "footer.accept": "យើងទទួល"
    }
  },

  langMeta(lang) {
    return this.meta[lang === "km" ? "km" : "en"];
  },

  flagImg(lang, { id = "" } = {}) {
    const meta = this.langMeta(lang);
    const idAttr = id ? ` id="${id}"` : "";
    return `<img class="lang-flag-img"${idAttr} src="${meta.flagSrc}" alt="${meta.flagAlt}" width="22" height="15" loading="lazy" decoding="async">`;
  },

  t(key) {
    const pack = this.strings[this.lang] || this.strings.en;
    return pack[key] ?? this.strings.en[key] ?? key;
  },

  setLang(lang) {
    this.lang = lang === "km" ? "km" : "en";
    document.documentElement.lang = this.lang === "km" ? "km" : "en";
  },

  applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (!key) return;
      const value = this.t(key);
      if (el.dataset.i18nAttr) {
        el.setAttribute(el.dataset.i18nAttr, value);
      } else {
        el.textContent = value;
      }
    });
  }
};
