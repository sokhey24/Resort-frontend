if (typeof window !== "undefined" && !window.SOLARA_API_BASE) {
  window.SOLARA_API_BASE = "http://127.0.0.1:8000/api";
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = Math.round((b - a) / 86400000);
  return diff > 0 ? diff : 0;
}

function currentCurrency() {
  const code = (typeof GuestPrefs !== "undefined" && GuestPrefs.getCurrency && GuestPrefs.getCurrency()) || "USD";
  const map = (typeof SolaraData !== "undefined" && SolaraData.currencies) || {};
  return map[code] || { code: "USD", symbol: "$", rate: 1, decimals: 2 };
}

// Prices in the catalogue are stored in USD; format into the selected currency.
function money(n) {
  const cur = currentCurrency();
  const value = Number(n) * cur.rate;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals
  });
  return `${cur.symbol}${formatted}`;
}

/**
 * Struck-through original, percentage badge, then the discounted rate.
 * Percentages always come from the API; this only formats them.
 */
function roomPriceHtml(room, suffix = " / night") {
  const price = Number(room?.pricePerNight) || 0;
  const percent = clampDiscount(room?.discountPercent ?? 0);

  if (percent <= 0) {
    return `<span class="price-now">${money(price)}${escapeHtml(suffix)}</span>`;
  }

  const net = Number(room?.discountedPricePerNight ?? discountedOf(price, percent));
  const label = String(Number(percent.toFixed(2)));
  return `<span class="price-was">${money(price)}</span>
    <span class="price-off">${escapeHtml(label)}% OFF</span>
    <span class="price-now">${money(net)}${escapeHtml(suffix)}</span>`;
}

/** "From" price on resort cards — same discount rules as room cards. */
function resortPriceFromHtml(resort) {
  const from = Number(resort?.priceFrom) || 0;
  const original = Number(resort?.priceFromOriginal ?? from);
  const percent = clampDiscount(resort?.priceFromDiscountPercent ?? 0);

  if (percent <= 0 || original <= from + 0.001) {
    return `<div class="price-row"><strong class="price-value price-now">${money(from)}</strong><span class="price-unit">/ night</span></div>`;
  }

  const label = String(Number(percent.toFixed(2)));
  return `<div class="price-row price-row-discount">
    <span class="price-was">${money(original)}</span>
    <span class="price-off">${escapeHtml(label)}% OFF</span>
  </div>
  <div class="price-row"><strong class="price-value price-now">${money(from)}</strong><span class="price-unit">/ night</span></div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

function newId() {
  return (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
}

function bookingCode() {
  const year = new Date().getFullYear();
  const serial = String(Math.floor(10000 + Math.random() * 89999));
  return `RMS-${year}-${serial}`;
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/* ------------------------------------------------------------------ *
 * Laravel API layer.
 *
 * The API is the source of truth for the catalogue and for every booking
 * figure. data.js stays only as an offline fallback while the migration
 * finishes, so a failed request degrades to the demo catalogue instead of
 * showing an empty site.
 *
 * API Room = one physical unit. RoomType = the sellable product. The guest
 * catalogue shows one card per room type, priced from its cheapest bookable
 * unit, and books against that unit's id.
 * ------------------------------------------------------------------ */
const GuestRemote = {
  config: {
    baseUrl: String(window.SOLARA_API_BASE || "http://localhost:8000/api").replace(/\/+$/, ""),
    timeoutMs: 8000
  },

  // null means "not hydrated"; the catalogue then falls back to data.js.
  state: { rooms: null, resorts: null, status: "idle", error: null, mode: "auto" },

  usingApi() {
    return this.state.status === "ready";
  },

  usingFallback() {
    return this.state.status === "fallback";
  },

  authHeaders() {
    const token = localStorage.getItem(GuestAuth.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async json(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const hasBody = options.body !== undefined && options.body !== null;
    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
          ...this.authHeaders(),
          ...(options.headers || {})
        },
        signal: controller.signal,
        ...options,
        body: hasBody ? JSON.stringify(options.body) : undefined
      });
      const payload = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, payload };
    } catch (err) {
      return { ok: false, status: 0, payload: null, error: err };
    } finally {
      clearTimeout(timer);
    }
  },

  /** Load resorts + rooms once per page. Safe to await more than once. */
  async hydrate() {
    if (this.state.status === "ready" || this.state.status === "loading") return this.state;
    this.state.status = "loading";

    const forceDemo = window.__SOLARA_API_MODE === "demo" || window.SOLARA_API_MODE === "demo";
    if (forceDemo) {
      this.state.status = "fallback";
      this.state.error = "demo mode";
      return this.state;
    }

    const [resortRes, apiRooms] = await Promise.all([
      this.json("/customer/resorts?per_page=50"),
      this.fetchAllCustomerRooms()
    ]);

    const apiResorts = asArray(resortRes.payload);
    const roomRes = { ok: apiRooms.length > 0 || resortRes.ok, payload: { data: apiRooms } };

    if (!resortRes.ok && !roomRes.ok) {
      this.state.status = "fallback";
      this.state.error = resortRes.error || roomRes.error || "API unavailable";
      return this.state;
    }

    if (resortRes.ok && apiResorts.length === 0 && roomRes.ok && apiRooms.length === 0) {
      this.state.resorts = [];
      this.state.rooms = [];
      this.state.status = "ready";
      this.state.mode = "api";
      return this.state;
    }

    const roomsForMap = roomRes.ok ? apiRooms : [];
    const resortsForMap = resortRes.ok ? apiResorts : [];

    this.state.resorts = this.mapResorts(resortsForMap, roomsForMap);
    this.state.rooms = roomsForMap.length ? this.mapRoomTypes(apiRooms) : [];
    this.state.status = "ready";
    this.state.mode = "api";
    if (!resortRes.ok || !roomRes.ok) {
      this.state.error = "partial";
    }
    return this.state;
  },

  /** Load every published room across paginated customer API responses. */
  async fetchAllCustomerRooms() {
    const all = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await this.json(`/customer/rooms?per_page=50&page=${page}`);
      if (!res.ok) break;
      all.push(...asArray(res.payload));
      lastPage = Number(res.payload?.last_page) || 1;
      page += 1;
    } while (page <= lastPage);
    return all;
  },

  /**
   * Room cards for one resort (dashboard rooms → guest “Choose your room” list).
   * Refreshes global room catalogue entries used by booking.
   */
  async loadResortRoomCards(resortId, ctx = {}) {
    if (!resortId) return [];

    const qs = new URLSearchParams({
      resort_id: String(resortId),
      per_page: "50"
    });
    if (ctx.checkIn) qs.set("check_in", ctx.checkIn);
    if (ctx.checkOut) qs.set("check_out", ctx.checkOut);

    let apiRooms = [];
    let page = 1;
    let lastPage = 1;
    do {
      qs.set("page", String(page));
      const res = await this.json(`/customer/rooms?${qs.toString()}`);
      if (!res.ok) break;
      apiRooms = apiRooms.concat(asArray(res.payload));
      lastPage = Number(res.payload?.last_page) || 1;
      page += 1;
    } while (page <= lastPage);

    let cards = apiRooms.length ? this.mapRoomTypes(apiRooms) : [];

    const guests = Math.max(1, Number(ctx.adults) || 2) + Math.max(0, Number(ctx.children) || 0);
    cards = cards.filter((c) => Number(c.capacity) >= guests);

    if (cards.length) {
      const byId = new Map((this.state.rooms || []).map((r) => [r.id, r]));
      cards.forEach((c) => byId.set(c.id, c));
      this.state.rooms = [...byId.values()];
    }

    return cards;
  },

  mapResorts(apiResorts, apiRooms) {
    const fallbackImages = (SolaraData.resorts || []).flatMap((res) => res.images || []);
    const demoByName = new Map(
      (SolaraData.resorts || []).map((res) => [String(res.name || "").trim().toLowerCase(), res])
    );

    return apiResorts.map((r, idx) => {
      const own = apiRooms.filter((room) => String(room.resort_id) === String(r.id));
      const images = own.flatMap((room) => (room.images || []).map((i) => i.url).filter(Boolean));
      const storageBase = GuestRemote.config.baseUrl.replace(/\/api$/, "");
      const coverUrl =
        r.cover_image_url ||
        (r.cover_image ? `${storageBase}/storage/${r.cover_image}` : "");
      const logoUrl =
        r.logo_url ||
        (r.logo ? `${storageBase}/storage/${r.logo}` : "");
      if (coverUrl) images.unshift(coverUrl);
      else if (logoUrl && !images.length) images.push(logoUrl);

      const demo = demoByName.get(String(r.name || "").trim().toLowerCase());
      const apiFacilities = r.facilities?.length ? r.facilities : own[0]?.resort?.facilities || [];
      const apiRating = Number(r.rating);
      const apiReviews = Number(r.review_count);

      return {
        id: String(r.id),
        name: r.name,
        city: r.city || "",
        country: r.country || "",
        address: r.address || "",
        type: r.resort_type || demo?.type || r.type || "Resort",
        rating: Number.isFinite(apiRating) && apiRating > 0 ? apiRating : demo?.rating || 4.5,
        reviewCount: Number.isFinite(apiReviews) ? apiReviews : demo?.reviewCount || 0,
        stars: Number(r.stars) || demo?.stars || 4,
        description: r.description || demo?.description || "",
        tagline: r.tagline || demo?.tagline || r.description || "",
        facilities: mapFacilityRefs(apiFacilities),
        promoTag: r.promo_tag || demo?.promoTag || "",
        featured: r.featured ?? demo?.featured ?? own.length > 0,
        freeCancellation: r.free_cancellation !== false && r.free_cancellation !== 0,
        breakfast: r.breakfast_options !== false && r.breakfast_options !== 0,
        roomTypeCount: Number(r.room_type_count) || 0,
        priceFrom: Number(r.price_from) || 0,
        priceFromOriginal: Number(r.price_from_original) || Number(r.price_from) || 0,
        priceFromDiscountPercent: clampDiscount(r.price_from_discount_percent ?? 0),
        images: images.length ? images : demo?.images?.length ? demo.images : [fallbackImages[idx % Math.max(1, fallbackImages.length)]].filter(Boolean)
      };
    });
  },

  /**
   * Collapse physical rooms into one bookable card per room type, keeping the
   * cheapest bookable unit as the representative. Discount percentages come
   * straight from the API accessors so the site can never disagree with it.
   */
  mapRoomTypes(apiRooms) {
    const groups = new Map();

    apiRooms.forEach((room) => {
      const type = room.room_type || {};
      const key = `${room.resort_id}:${room.room_type_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ room, type });
    });

    const cards = [];
    groups.forEach((entries, key) => {
      const bookable = entries.filter((e) => e.room.status === "available");
      const pool = bookable.length ? bookable : entries;
      pool.sort((a, b) => {
        const pa = Number(a.room.discounted_price_per_night ?? a.room.price_per_night);
        const pb = Number(b.room.discounted_price_per_night ?? b.room.price_per_night);
        return pa - pb || Number(a.room.price_per_night) - Number(b.room.price_per_night);
      });

      const { room, type } = pool[0];
      const price = Number(room.price_per_night) || 0;
      const percent = clampDiscount(room.effective_discount_percent ?? type.discount_percent ?? 0);
      const images = entries.flatMap((e) => (e.room.images || []).map((i) => i.url).filter(Boolean));
      const capacity = Number(type.max_occupancy) || 2;

      cards.push({
        id: `rt-${key.replace(":", "-")}`,
        apiRoomId: Number(room.id),
        apiRoomIds: entries.map((e) => Number(e.room.id)),
        resortId: String(room.resort_id),
        code: room.room_number || "",
        name: type.name || `Room ${room.room_number}`,
        roomType: type.name || "Room",
        description: type.description || room.notes || "",
        longDescription: type.description || room.notes || "",
        pricePerNight: price,
        discountPercent: percent,
        discountedPricePerNight: Number(room.discounted_price_per_night ?? discountedOf(price, percent)),
        capacity,
        adults: capacity,
        children: Math.max(0, capacity - 1),
        size: type.size_sqm ? `${Math.round(Number(type.size_sqm))} sqm` : "",
        bedType: type.bed_type || "",
        amenities: buildGuestRoomAmenities(room, type),
        images: images.length ? images : [SolaraData.images.lobby],
        rating: 4.6,
        reviewCount: 0,
        reviews: [],
        available: bookable.length > 0,
        featured: false,
        freeCancellation: type.free_cancellation !== false && type.free_cancellation !== 0,
        breakfastIncluded: type.breakfast_included === true || type.breakfast_included === 1,
        roomsLeft: bookable.length
      });
    });

    return cards.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }
};

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function formatApiDate(value) {
  if (!value) return "";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function mapApiBooking(b) {
  const room = (b.rooms && b.rooms[0]) || {};
  const type = room.room_type || {};
  const pivot = room.pivot || {};
  const couponPart = Math.max(0, Number(b.discount || 0) - Number(b.room_discount_total || 0));
  return {
    id: String(b.id),
    code: b.booking_code || b.code || "",
    userId: b.user_id,
    status: b.status,
    checkIn: formatApiDate(b.check_in),
    checkOut: formatApiDate(b.check_out),
    nights: Number(b.nights) || 0,
    adults: Number(b.adults) || 0,
    children: Number(b.children) || 0,
    guests: Number(b.adults || 0) + Number(b.children || 0),
    subtotal: Number(b.subtotal),
    discountPercent: clampDiscount(pivot.discount_percent ?? 0),
    roomDiscount: Number(b.room_discount_total || 0),
    couponDiscount: couponPart,
    discount: Number(b.discount || 0),
    tax: Number(b.tax_amount || 0),
    serviceCharge: Number(b.service_charge_amount || 0),
    total: Number(b.total_amount || 0),
    pricePerNight: Number(pivot.price_per_night || room.price_per_night || 0),
    roomName: type.name || room.room_number || "Room",
    roomCode: room.room_number || "",
    resortId: b.resort_id != null ? String(b.resort_id) : "",
    resortName: b.resort?.name || "",
    created_at: b.created_at || new Date().toISOString(),
    pricedBy: "api"
  };
}

/** Sanctum session — same keys as the staff dashboard. */
const GuestAuth = {
  tokenKey: "access_token",
  userKey: "user",

  clearLegacyBrowserAuth() {
    try {
      if (localStorage.getItem(this.tokenKey)) return;
      if (localStorage.getItem(Store.keys.session)) {
        Store.logout();
      }
    } catch {
      /* ignore */
    }
  },

  setSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    Store.setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || ""
    });
  },

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    Store.logout();
  },

  token() {
    return localStorage.getItem(this.tokenKey);
  },

  storedUser() {
    try {
      return JSON.parse(localStorage.getItem(this.userKey) || "null");
    } catch {
      return null;
    }
  },

  sessionView() {
    const user = this.storedUser();
    if (!user || !this.token()) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || ""
    };
  },

  apiError(res) {
    if (res.status === 0) {
      if (location.protocol === "file:") {
        return "This page was opened as a file (file://). Browsers block API calls. Open the site via http://localhost (XAMPP/Apache or Live Server), not by double-clicking the HTML file.";
      }
      if (res.error?.name === "AbortError") {
        return "Request timed out. Ensure Web_Resort_api is running (php artisan serve).";
      }
      return `Cannot reach the resort API at ${GuestRemote.config.baseUrl}. Start the Laravel API and check your network.`;
    }
    if (res.payload?.message) return res.payload.message;
    if (res.payload?.errors) {
      const first = Object.values(res.payload.errors).flat()[0];
      if (first) return String(first);
    }
    return "Request failed. Please try again.";
  }
};

function clampDiscount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function discountedOf(price, percent) {
  const base = Number(price) || 0;
  return roundMoney(base - (base * clampDiscount(percent)) / 100);
}

function parseAmenityList(raw) {
  if (Array.isArray(raw)) return raw.map((a) => String(a).trim()).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((a) => String(a).trim()).filter(Boolean);
    } catch (_) {
      return raw.split(",").map((a) => a.trim()).filter(Boolean);
    }
  }
  return [];
}

/** Amenity pills on resort detail room rows (excludes bed type — shown in facts row). */
function buildGuestRoomAmenities(room, type) {
  const bed = String(type?.bed_type || "").trim();
  const pills = [];
  const view = String(room?.view || "").trim();
  if (view) pills.push(view);
  parseAmenityList(type?.amenities).forEach((a) => pills.push(a));
  return [...new Set(pills)].filter((a) => a && a !== bed).slice(0, 6);
}

function mapFacilityRefs(list) {
  const catalog = SolaraData.facilities || [];
  return (list || [])
    .map((f) => {
      if (typeof f === "string") return f;
      const name = String(f?.name || "").trim();
      if (!name) return "";
      const hit = catalog.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (hit) return hit.id;
      return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    })
    .filter(Boolean);
}

/** Cheapest payable night for a resort's room cards (post room/type discount). */
function resortFromPricing(rooms) {
  if (!rooms.length) {
    return { priceFrom: 0, priceFromOriginal: 0, priceFromDiscountPercent: 0 };
  }

  let best = rooms[0];
  let bestPay = Number(best.discountedPricePerNight ?? best.pricePerNight);
  for (const room of rooms) {
    const pay = Number(room.discountedPricePerNight ?? room.pricePerNight);
    if (pay < bestPay) {
      best = room;
      bestPay = pay;
    }
  }

  const original = Number(best.pricePerNight) || 0;
  const percent = clampDiscount(best.discountPercent ?? 0);
  const from = Number(best.discountedPricePerNight ?? discountedOf(original, percent));

  return {
    priceFrom: from,
    priceFromOriginal: original,
    priceFromDiscountPercent: percent
  };
}

function deriveResortPromoTag(resort, rooms) {
  if (resort.promoTag) return resort.promoTag;

  const maxPct = rooms.reduce((max, r) => Math.max(max, clampDiscount(r.discountPercent ?? 0)), 0);
  if (maxPct > 0) {
    return `Save up to ${Number(maxPct.toFixed(0))}% on rooms`;
  }

  return "";
}

const GuestAPI = {
  remote: GuestRemote,

  /** Await before first render so the catalogue reflects the API, not data.js. */
  ready() {
    GuestAuth.clearLegacyBrowserAuth();
    if (!GuestRemote._hydration) {
      GuestRemote._hydration = GuestRemote.hydrate().then(() => this.auth.sync());
    }
    return GuestRemote._hydration;
  },

  /** Live room list for resort detail (respects check-in / check-out from the form). */
  resortRoomCards(resortId, ctx) {
    return GuestRemote.loadResortRoomCards(resortId, ctx);
  },

  catalog: {
    /** Raw site-shaped rooms from the API when hydrated, otherwise data.js. */
    source() {
      return GuestRemote.usingApi() ? GuestRemote.state.rooms : SolaraData.rooms;
    },
    rooms() {
      return this.source().map((room) => ({
        ...room,
        discountPercent: clampDiscount(room.discountPercent ?? 0),
        discountedPricePerNight: Number(
          room.discountedPricePerNight ?? discountedOf(room.pricePerNight, room.discountPercent ?? 0)
        ),
        gallery: room.images,
        image: room.images[0],
        price: room.pricePerNight,
        tag: room.roomType,
        guests: room.capacity,
        beds: room.bedType
      }));
    },
    room(id) {
      return this.rooms().find((r) => r.id === id) || null;
    },
    activities() {
      return SolaraData.activities;
    },
    activity(id) {
      return SolaraData.activities.find((a) => a.id === id) || null;
    },
    services() {
      return SolaraData.services;
    },
    dining() {
      return SolaraData.dining;
    },
    gallery() {
      return SolaraData.gallery;
    },
    team() {
      return SolaraData.team;
    },
    promotions() {
      return SolaraData.promotions;
    },
    promo(code) {
      const key = String(code || "").toUpperCase().trim();
      return SolaraData.promotions.find((p) => p.code === key && p.active) || null;
    },
    testimonials() {
      return SolaraData.testimonials;
    },
    resort() {
      return SolaraData.resort;
    },
    facilities() {
      return SolaraData.facilities || [];
    },
    facility(id) {
      const key = String(id ?? "").trim();
      const list = SolaraData.facilities || [];
      const direct = list.find((f) => f.id === key);
      if (direct) return direct;
      const byName = list.find((f) => f.name.toLowerCase() === key.toLowerCase());
      if (byName) return byName;
      const slug = key.replace(/-/g, " ");
      const fuzzy = list.find((f) => f.name.toLowerCase().includes(slug) || slug.includes(f.name.toLowerCase()));
      if (fuzzy) return fuzzy;
      return { id: key, name: key.replace(/-/g, " "), icon: "fa-circle-check" };
    },
    // All resorts, each enriched with a cover image, gallery, room list and
    // a computed "from" price so cards and filters have everything they need.
    resorts() {
      const allRooms = this.rooms();
      const useApiCatalog = GuestRemote.usingApi() && Array.isArray(GuestRemote.state.resorts);
      const source = useApiCatalog ? GuestRemote.state.resorts : SolaraData.resorts || [];
      return source.map((resort) => {
        const rooms = allRooms.filter((r) => r.resortId === resort.id);
        const fromPricing =
          useApiCatalog && Number(resort.priceFrom) > 0
            ? {
                priceFrom: Number(resort.priceFrom),
                priceFromOriginal: Number(resort.priceFromOriginal ?? resort.priceFrom),
                priceFromDiscountPercent: clampDiscount(resort.priceFromDiscountPercent ?? 0)
              }
            : resortFromPricing(rooms);
        const promoTag = deriveResortPromoTag(resort, rooms);
        const roomCount =
          Number(resort.roomTypeCount) > 0 ? Number(resort.roomTypeCount) : rooms.length;
        return {
          ...resort,
          image: resort.images[0],
          gallery: resort.images,
          rooms,
          roomCount,
          ...fromPricing,
          promoTag,
          freeCancellation:
            resort.freeCancellation ?? rooms.some((r) => r.freeCancellation),
          breakfast: resort.breakfast ?? rooms.some((r) => r.breakfastIncluded)
        };
      });
    },
    resortById(id) {
      return this.resorts().find((r) => r.id === id) || null;
    },
    roomsByResort(id) {
      return this.rooms().filter((r) => r.resortId === id);
    }
  },

  isRoomFree(roomId, checkIn, checkOut, excludeId) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const blocking = ["pending", "confirmed", "checked_in"];
    return !Store.bookings().some((b) => {
      if (excludeId && b.id === excludeId) return false;
      if (b.roomId !== roomId) return false;
      if (!blocking.includes(b.status)) return false;
      return datesOverlap(start, end, new Date(b.checkIn), new Date(b.checkOut));
    });
  },

  quote(input) {
    const room = this.catalog.room(input.roomId);
    const adults = Number(input.adults || 0);
    const children = Number(input.children || 0);
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const errors = [];

    if (!room) errors.push("Select a valid room.");
    if (!input.checkIn || !input.checkOut) errors.push("Choose check-in and check-out dates.");
    if (nights < 1) errors.push("Check-out must be after check-in.");
    if (adults < 1) errors.push("At least one adult is required.");
    if (room && adults > room.adults) errors.push(`This room allows up to ${room.adults} adults.`);
    if (room && children > room.children) errors.push(`This room allows up to ${room.children} children.`);
    if (room && adults + children > room.capacity) errors.push(`This room sleeps ${room.capacity} guests.`);
    if (room && !room.available) errors.push("This room is not in the current catalogue as available.");
    if (room && nights && !this.isRoomFree(room.id, input.checkIn, input.checkOut)) {
      errors.push("Booking unavailable for these dates on this device (another local booking overlaps).");
    }

    // Room percentage first, coupon second on the already-discounted amount —
    // the same order the API uses, so this preview matches the authoritative quote.
    const discountPercent = room ? clampDiscount(room.discountPercent ?? 0) : 0;
    const subtotal = room && nights ? roundMoney(room.pricePerNight * nights) : 0;
    const roomDiscount = roundMoney((subtotal * discountPercent) / 100);
    const netSubtotal = roundMoney(subtotal - roomDiscount);

    let promo = null;
    let couponDiscount = 0;
    const promoCode = String(input.promo || "").toUpperCase().trim();
    if (promoCode) {
      promo = this.catalog.promo(promoCode);
      if (!promo) errors.push("Invalid promo code.");
      else if (new Date(promo.expiration) < new Date(new Date().toISOString().slice(0, 10))) errors.push("This promo has expired.");
      else if (nights && nights < promo.minimumNights) errors.push(`${promo.code} requires at least ${promo.minimumNights} night(s).`);
      else if (promo.minChildren && children < promo.minChildren) errors.push("FAMILY requires at least one child.");
      else couponDiscount = roundMoney(netSubtotal * (promo.discountValue / 100));
    }

    const discount = roundMoney(roomDiscount + couponDiscount);
    const afterDiscount = roundMoney(subtotal - discount);
    const serviceCharge = roundMoney(afterDiscount * SolaraData.rates.serviceCharge);
    const tax = roundMoney(afterDiscount * SolaraData.rates.tax);
    const total = roundMoney(afterDiscount + serviceCharge + tax);

    return {
      room,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      adults,
      children,
      guests: adults + children,
      promo: promo && couponDiscount ? promo.code : "",
      subtotal,
      discountPercent,
      roomDiscount,
      couponDiscount,
      discount,
      afterDiscount,
      serviceCharge,
      tax,
      total,
      authoritative: false,
      errors
    };
  },

  /**
   * Authoritative quote. Used before money is committed; falls back to the local
   * preview only when the API cannot be reached, and flags which one was used.
   */
  async quoteAuthoritative(input) {
    const local = this.quote(input);
    const roomId = local.room?.apiRoomId;

    if (!GuestRemote.usingApi() || !roomId || local.nights < 1) {
      return local;
    }

    const res = await GuestRemote.json("/customer/booking/quote", {
      method: "POST",
      body: {
        room_ids: [roomId],
        check_in: local.checkIn,
        check_out: local.checkOut,
        adults: local.adults,
        children: local.children,
        coupon_code: String(input.promo || "").trim() || undefined
      }
    });

    if (!res.ok || !res.payload?.data) {
      const messages = res.payload?.errors
        ? Object.values(res.payload.errors).flat()
        : [];
      return { ...local, errors: [...local.errors, ...messages], authoritative: false };
    }

    const q = res.payload.data;
    const line = (q.rooms || [])[0] || {};

    return {
      ...local,
      nights: Number(q.nights) || local.nights,
      subtotal: Number(q.subtotal),
      discountPercent: clampDiscount(line.discount_percent ?? 0),
      roomDiscount: Number(q.room_discount_total),
      couponDiscount: Number(q.coupon_discount),
      discount: Number(q.discount),
      afterDiscount: roundMoney(Number(q.subtotal) - Number(q.discount)),
      serviceCharge: Number(q.service_charge),
      tax: Number(q.tax),
      total: Number(q.total),
      promo: q.coupon_code || "",
      authoritative: true,
      errors: local.errors
    };
  },

  auth: {
    async register({ name, email, phone, password, confirm }) {
      const res = await GuestRemote.json("/auth/register", {
        method: "POST",
        body: {
          name: String(name).trim(),
          email: String(email).trim(),
          phone: String(phone || "").trim() || undefined,
          password: String(password),
          password_confirmation: String(confirm ?? password)
        }
      });
      if (!res.ok) {
        return { ok: false, error: GuestAuth.apiError(res) };
      }
      const user = res.payload.user;
      GuestAuth.setSession(res.payload.access_token, user);
      return { ok: true, user };
    },

    async login({ email, password }) {
      const res = await GuestRemote.json("/auth/login", {
        method: "POST",
        body: { email: String(email).trim(), password: String(password) }
      });
      if (!res.ok) {
        return { ok: false, error: GuestAuth.apiError(res) };
      }
      if (res.payload.two_factor_required) {
        return { ok: false, error: "Two-factor sign-in is not supported on the guest site yet." };
      }
      GuestAuth.setSession(res.payload.access_token, res.payload.user);
      return { ok: true, user: res.payload.user };
    },

    async logout() {
      if (GuestAuth.token()) {
        await GuestRemote.json("/auth/logout", { method: "POST", body: {} });
      }
      GuestAuth.clearSession();
      GuestAPI.bookings._list = null;
    },

    session() {
      return GuestAuth.sessionView();
    },

    currentUser() {
      const user = GuestAuth.storedUser();
      if (!user) return null;
      return {
        ...user,
        profile: { city: user.address || user.profile?.city || "" },
        settings: user.settings || { emailUpdates: true, bookingAlerts: true }
      };
    },

    requireSession() {
      const session = this.session();
      if (!session) {
        location.href = "login.html";
        return null;
      }
      return session;
    },

    async sync() {
      if (!GuestAuth.token()) return null;
      const res = await GuestRemote.json("/auth/me");
      if (!res.ok) {
        GuestAuth.clearSession();
        return null;
      }
      GuestAuth.setSession(GuestAuth.token(), res.payload.user);
      return res.payload.user;
    },

    async updateProfile(patch) {
      if (!GuestAuth.token()) return { ok: false, error: "Sign in required." };
      const body = {
        name: patch.name,
        phone: patch.phone,
        address: patch.profile?.city ?? patch.address
      };
      const res = await GuestRemote.json("/profile", { method: "PUT", body });
      if (!res.ok) {
        return { ok: false, error: GuestAuth.apiError(res) };
      }
      GuestAuth.setSession(GuestAuth.token(), res.payload.user);
      return { ok: true, user: res.payload.user };
    }
  },

  bookings: {
    _list: null,

    async refresh() {
      if (!GuestAuth.token()) {
        this._list = [];
        return [];
      }
      const res = await GuestRemote.json("/customer/bookings");
      if (!res.ok) {
        return this._list || [];
      }
      this._list = asArray(res.payload).map(mapApiBooking);
      return this._list;
    },

    async create(form) {
      if (!GuestAuth.token()) {
        return { ok: false, errors: ["Login or register to book with the resort system."] };
      }
      const quote = await GuestAPI.quoteAuthoritative(form);
      if (quote.errors.length) return { ok: false, errors: quote.errors };
      if (!quote.room?.apiRoomId) {
        return { ok: false, errors: ["Room catalogue is offline. Connect to the API and try again."] };
      }

      const noteParts = [
        form.note,
        form.guestName ? `Guest: ${form.guestName}` : "",
        form.country ? `Country: ${form.country}` : ""
      ].filter(Boolean);

      const res = await GuestRemote.json("/customer/bookings", {
        method: "POST",
        body: {
          resort_id: Number(quote.room.resortId),
          room_ids: [quote.room.apiRoomId],
          check_in: quote.checkIn,
          check_out: quote.checkOut,
          adults: quote.adults,
          children: quote.children,
          coupon_code: quote.promo || undefined,
          special_requests: noteParts.join("\n") || undefined,
          source: "website"
        }
      });

      if (!res.ok) {
        const msg = GuestAuth.apiError(res);
        const fieldErrors = res.payload?.errors ? Object.values(res.payload.errors).flat() : [];
        return { ok: false, errors: fieldErrors.length ? fieldErrors : [msg], error: msg };
      }

      const booking = mapApiBooking(res.payload.data || res.payload);
      booking.paymentMethod = String(form.paymentMethod || "pay-at-resort");
      booking.email = form.email;
      booking.guestName = form.guestName;
      this._list = [booking, ...(this._list || []).filter((b) => b.id !== booking.id)];

      const session = GuestAPI.auth.session();
      if (session) {
        GuestAPI.notifications.create({
          userId: session.id,
          type: "booking",
          title: "Booking Created",
          message: `Your booking ${booking.code} has been created.`,
          bookingId: booking.id
        });
      }
      sessionStorage.setItem("solara_last_booking", JSON.stringify(booking));
      return { ok: true, booking };
    },

    mine() {
      return this._list || [];
    },

    get(id) {
      return (this._list || []).find((b) => b.id === String(id) || b.code === id) || null;
    },

    async fetchOne(id) {
      if (!GuestAuth.token()) return null;
      const res = await GuestRemote.json(`/customer/bookings/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const booking = mapApiBooking(res.payload.data || res.payload);
      this._list = [booking, ...(this._list || []).filter((b) => b.id !== booking.id)];
      return booking;
    },

    async cancel(id) {
      let booking = this.get(id);
      if (!booking) booking = await this.fetchOne(id);
      if (!booking) return { ok: false, error: "Booking not found." };
      if (!["pending", "confirmed"].includes(booking.status)) {
        return { ok: false, error: "This booking can no longer be cancelled from the guest site." };
      }
      const res = await GuestRemote.json(`/customer/bookings/${encodeURIComponent(booking.id)}`, {
        method: "PUT",
        body: { status: "cancelled" }
      });
      if (!res.ok) {
        return { ok: false, error: GuestAuth.apiError(res) };
      }
      const updated = mapApiBooking(res.payload.data || res.payload);
      this._list = (this._list || []).map((b) => (b.id === updated.id ? updated : b));
      const session = GuestAPI.auth.session();
      if (session) {
        GuestAPI.notifications.create({
          userId: session.id,
          type: "booking",
          title: "Booking Cancelled",
          message: `Your booking ${updated.code} was cancelled.`,
          bookingId: updated.id
        });
      }
      return { ok: true, booking: updated };
    }
  },

  payments: {
    async createKhqr(bookingId, gateway = "aba-khqr") {
      if (!GuestAuth.token()) {
        return { ok: false, error: "Sign in required." };
      }
      const res = await GuestRemote.json(`/customer/bookings/${encodeURIComponent(bookingId)}/khqr`, {
        method: "POST",
        body: { gateway }
      });
      if (!res.ok) {
        return { ok: false, error: GuestAuth.apiError(res) };
      }
      return { ok: true, payment: res.payload.data };
    },

    /**
     * Poll settlement — prefers md5 (Payment_process/bakong-ecom contract), falls back to payment id.
     */
    async verifyKhqr(paymentIdOrMd5) {
      if (!GuestAuth.token()) {
        return { ok: false, error: "Sign in required." };
      }
      const md5 =
        typeof paymentIdOrMd5 === "string" && /^[a-f0-9]{32}$/i.test(paymentIdOrMd5)
          ? paymentIdOrMd5
          : null;
      const res = md5
        ? await GuestRemote.json("/customer/khqr/verify", {
            method: "POST",
            body: { md5: md5.toLowerCase() }
          })
        : await GuestRemote.json(`/customer/payments/${encodeURIComponent(paymentIdOrMd5)}/khqr/verify`, {
            method: "POST",
            body: {}
          });
      const payload = res.payload || {};
      if (!res.ok && res.status !== 200 && res.status !== 409 && res.status !== 502) {
        return { ok: false, error: GuestAuth.apiError(res), status: payload.status };
      }
      return {
        ok: true,
        paid: Boolean(payload.paid),
        status: payload.status,
        message: payload.message,
        receipt: payload.data
      };
    }
  },

  notifications: {
    create({ userId, type, title, message, bookingId }) {
      return Store.addNotification({
        id: newId(),
        userId,
        type,
        title,
        message,
        bookingId: bookingId || null,
        read: false,
        created_at: new Date().toISOString()
      });
    },
    mine() {
      return Store.myNotifications();
    },
    unreadCount() {
      return Store.myNotifications().filter((n) => !n.read).length;
    },
    markRead(id) {
      Store.markNotificationRead(id);
    },
    markAllRead() {
      Store.markAllNotificationsRead();
    }
  },

  contact: {
    send(payload) {
      return Store.addMessage({
        ...payload,
        id: newId(),
        created_at: new Date().toISOString()
      });
    }
  },

  // Temporary booking state carried between booking → payment → confirmation.
  draft: {
    key: "solara_booking_draft",
    save(data) {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
      } catch {
        /* storage unavailable */
      }
      return data;
    },
    get() {
      try {
        return JSON.parse(localStorage.getItem(this.key) || "null");
      } catch {
        return null;
      }
    },
    clear() {
      localStorage.removeItem(this.key);
    }
  }
};

function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 2800);
}

function emptyState(title, text, href, label) {
  return `<div class="empty-state">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${href ? `<a class="btn btn-primary" href="${href}">${escapeHtml(label || "Continue")}</a>` : ""}
  </div>`;
}

function statusBadge(status) {
  return `<span class="badge badge-${escapeHtml(status)}">${escapeHtml(String(status).replace("_", " "))}</span>`;
}
