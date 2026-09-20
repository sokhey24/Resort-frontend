/* ------------------------------------------------------------------ *
 * Shared Agoda-style search widget.
 * Rendered into any container by id so the home hero and the results
 * page reuse exactly the same markup + behaviour (no duplication).
 * Usage: SearchWidget.render("heroSearch", { redirect: true });
 * ------------------------------------------------------------------ */
const SearchWidget = {
  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  addDays(iso, days) {
    const d = new Date(iso || this.todayISO());
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  },

  // Destination suggestions: every resort (by name) + unique cities.
  destinations() {
    const resorts = (typeof GuestAPI !== "undefined" && GuestAPI.catalog.resorts()) || [];
    const cities = [...new Set(resorts.map((r) => r.city))];
    return [
      ...cities.map((c) => ({ type: "city", label: c, value: c, icon: "fa-location-dot" })),
      ...resorts.map((r) => ({ type: "resort", label: r.name, value: r.name, sub: r.city, id: r.id, icon: "fa-hotel" }))
    ];
  },

  guestSummary(g) {
    const parts = [`${g.adults} adult${g.adults > 1 ? "s" : ""}`];
    if (g.children) parts.push(`${g.children} child${g.children > 1 ? "ren" : ""}`);
    parts.push(`${g.rooms} room${g.rooms > 1 ? "s" : ""}`);
    return parts.join(" · ");
  },

  readInitial() {
    const q = new URLSearchParams(location.search);
    const today = this.todayISO();
    const checkIn = q.get("checkIn") || today;
    return {
      destination: q.get("destination") || "",
      checkIn,
      checkOut: q.get("checkOut") || this.addDays(checkIn, 1),
      adults: Math.max(1, Number(q.get("adults") || 2)),
      children: Math.max(0, Number(q.get("children") || 0)),
      rooms: Math.max(1, Number(q.get("rooms") || 1))
    };
  },

  render(containerId, options = {}) {
    const host = document.getElementById(containerId);
    if (!host) return;
    const v = { ...this.readInitial(), ...(options.values || {}) };
    const guests = { adults: v.adults, children: v.children, rooms: v.rooms };

    host.classList.add("search-bar-host");
    host.innerHTML = `
      <form class="search-bar" novalidate>
        <div class="sb-field sb-destination">
          <label>Destination / Resort</label>
          <div class="sb-input-icon">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input type="text" name="destination" value="${escapeHtml(v.destination)}" placeholder="Resort name or city" autocomplete="off" aria-label="Destination or resort">
          </div>
          <div class="sb-suggestions" hidden></div>
        </div>
        <div class="sb-field">
          <label>Check-in</label>
          <div class="sb-input-icon">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
            <input type="date" name="checkIn" value="${escapeHtml(v.checkIn)}" min="${this.todayISO()}" aria-label="Check-in date">
          </div>
        </div>
        <div class="sb-field">
          <label>Check-out</label>
          <div class="sb-input-icon">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
            <input type="date" name="checkOut" value="${escapeHtml(v.checkOut)}" min="${this.addDays(v.checkIn, 1)}" aria-label="Check-out date">
          </div>
        </div>
        <div class="sb-field sb-guests">
          <label>Guests &amp; Rooms</label>
          <button type="button" class="sb-guests-toggle" aria-haspopup="true" aria-expanded="false">
            <i class="fa-solid fa-user-group" aria-hidden="true"></i>
            <span class="sb-guests-label">${this.guestSummary(guests)}</span>
          </button>
          <div class="sb-guests-panel" hidden>
            ${this.counterRow("Adults", "Ages 13+", "adults", guests.adults, 1)}
            ${this.counterRow("Children", "Ages 0-12", "children", guests.children, 0)}
            ${this.counterRow("Rooms", "", "rooms", guests.rooms, 1)}
            <button type="button" class="btn btn-primary sb-guests-done">Done</button>
          </div>
        </div>
        <button class="btn btn-primary sb-submit" type="submit">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search Resorts
        </button>
      </form>`;

    this.wire(host, guests, options);
  },

  counterRow(title, sub, key, value, min) {
    return `
      <div class="sb-counter" data-key="${key}" data-min="${min}">
        <div>
          <strong>${title}</strong>
          ${sub ? `<span>${sub}</span>` : ""}
        </div>
        <div class="sb-counter-ctrl">
          <button type="button" class="sb-step" data-dir="-1" aria-label="Decrease ${title.toLowerCase()}">&minus;</button>
          <span class="sb-count" data-count>${value}</span>
          <button type="button" class="sb-step" data-dir="1" aria-label="Increase ${title.toLowerCase()}">+</button>
        </div>
      </div>`;
  },

  wire(host, guests, options) {
    const form = host.querySelector(".search-bar");
    const destInput = form.querySelector("[name=destination]");
    const suggestBox = form.querySelector(".sb-suggestions");
    const checkIn = form.querySelector("[name=checkIn]");
    const checkOut = form.querySelector("[name=checkOut]");
    const guestToggle = form.querySelector(".sb-guests-toggle");
    const guestPanel = form.querySelector(".sb-guests-panel");
    const guestLabel = form.querySelector(".sb-guests-label");
    let selectedResortId = "";

    // Destination autocomplete ------------------------------------------------
    const all = this.destinations();
    const showSuggestions = (query) => {
      const q = query.trim().toLowerCase();
      const list = (q
        ? all.filter((d) => d.label.toLowerCase().includes(q) || (d.sub || "").toLowerCase().includes(q))
        : all
      ).slice(0, 8);
      if (!list.length) {
        suggestBox.hidden = true;
        return;
      }
      suggestBox.innerHTML = list
        .map(
          (d) => `<button type="button" class="sb-suggestion" data-value="${escapeHtml(d.value)}" data-id="${escapeHtml(d.id || "")}">
            <i class="fa-solid ${d.icon}" aria-hidden="true"></i>
            <span><strong>${escapeHtml(d.label)}</strong>${d.sub ? `<small>${escapeHtml(d.sub)}</small>` : `<small>${d.type === "city" ? "City / area" : ""}</small>`}</span>
          </button>`
        )
        .join("");
      suggestBox.hidden = false;
    };
    destInput.addEventListener("focus", () => showSuggestions(destInput.value));
    destInput.addEventListener("input", () => {
      selectedResortId = "";
      showSuggestions(destInput.value);
    });
    suggestBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".sb-suggestion");
      if (!btn) return;
      destInput.value = btn.dataset.value;
      selectedResortId = btn.dataset.id || "";
      suggestBox.hidden = true;
    });
    document.addEventListener("click", (e) => {
      if (!form.querySelector(".sb-destination").contains(e.target)) suggestBox.hidden = true;
    });

    // Date coupling -----------------------------------------------------------
    checkIn.addEventListener("change", () => {
      const min = this.addDays(checkIn.value, 1);
      checkOut.min = min;
      if (!checkOut.value || checkOut.value <= checkIn.value) checkOut.value = min;
    });

    // Guests & rooms popover --------------------------------------------------
    const closeGuests = () => {
      guestPanel.hidden = true;
      guestToggle.setAttribute("aria-expanded", "false");
    };
    guestToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = guestPanel.hidden;
      guestPanel.hidden = !open;
      guestToggle.setAttribute("aria-expanded", String(open));
    });
    guestPanel.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", (e) => {
      if (!form.querySelector(".sb-guests").contains(e.target)) closeGuests();
    });
    form.querySelector(".sb-guests-done")?.addEventListener("click", closeGuests);
    guestPanel.querySelectorAll(".sb-step").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".sb-counter");
        const key = row.dataset.key;
        const min = Number(row.dataset.min);
        const dir = Number(btn.dataset.dir);
        guests[key] = Math.max(min, Math.min(20, guests[key] + dir));
        row.querySelector("[data-count]").textContent = guests[key];
        guestLabel.textContent = this.guestSummary(guests);
      });
    });

    // Submit ------------------------------------------------------------------
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (checkOut.value <= checkIn.value) {
        toast("Check-out must be after check-in.");
        return;
      }
      const qs = new URLSearchParams({
        destination: destInput.value.trim(),
        resortId: selectedResortId,
        checkIn: checkIn.value,
        checkOut: checkOut.value,
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms
      });
      if (typeof options.onSubmit === "function") {
        options.onSubmit(Object.fromEntries(qs.entries()));
        return;
      }
      location.href = `resorts.html?${qs.toString()}`;
    });
  }
};
