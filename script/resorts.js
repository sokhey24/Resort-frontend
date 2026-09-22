/* ------------------------------------------------------------------ *
 * Resort search results + resort details (Agoda-inspired workflow).
 * Depends on: data.js, api.js (GuestAPI, money, escapeHtml, emptyState,
 * toast), search.js (SearchWidget).
 * ------------------------------------------------------------------ */

function searchContext() {
  const q = new URLSearchParams(location.search);
  const today = new Date().toISOString().slice(0, 10);
  const checkIn = q.get("checkIn") || today;
  const next = new Date(checkIn);
  next.setDate(next.getDate() + 1);
  return {
    destination: q.get("destination") || "",
    resortId: q.get("resortId") || "",
    checkIn,
    checkOut: q.get("checkOut") || next.toISOString().slice(0, 10),
    adults: Math.max(1, Number(q.get("adults") || 2)),
    children: Math.max(0, Number(q.get("children") || 0)),
    rooms: Math.max(1, Number(q.get("rooms") || 1))
  };
}

function contextQuery(ctx, extra = {}) {
  return new URLSearchParams({
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    adults: ctx.adults,
    children: ctx.children,
    rooms: ctx.rooms,
    ...extra
  }).toString();
}

function ratingWord(score) {
  if (score >= 4.7) return "Exceptional";
  if (score >= 4.4) return "Excellent";
  if (score >= 4.0) return "Very good";
  if (score >= 3.5) return "Good";
  return "Pleasant";
}

function starIcons(count) {
  let html = "";
  for (let i = 0; i < Math.round(count); i += 1) html += '<i class="fa-solid fa-star"></i>';
  return `<span class="hotel-stars" aria-label="${count}-star resort">${html}</span>`;
}

function facilityChipLabel(fid) {
  const f = GuestAPI.catalog.facility(fid);
  return `<span class="facility-chip"><i class="fa-solid ${f.icon}" aria-hidden="true"></i> ${escapeHtml(f.name)}</span>`;
}

// Shared resort card, reused by the home page and the results page.
function resortCardMarkup(resort, ctx) {
  const context = ctx || searchContext();
  const q = contextQuery(context, { id: resort.id });
  const facilityChips = resort.facilities.slice(0, 5).map((fid) => facilityChipLabel(fid)).join("");
  return `
    <article class="resort-card">
      <div class="resort-card-media">
        <img src="${resort.image}" alt="${escapeHtml(resort.name)}" loading="lazy">
        ${resort.promoTag ? `<span class="resort-promo">${escapeHtml(resort.promoTag)}</span>` : ""}
        <span class="resort-type-badge">${escapeHtml(resort.type)}</span>
      </div>
      <div class="resort-card-body">
        <div class="resort-card-head">
          <div>
            <h3>${escapeHtml(resort.name)} ${starIcons(resort.stars)}</h3>
            <p class="resort-loc"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(resort.city)}, ${escapeHtml(resort.country)}</p>
          </div>
          <div class="rating-pill" title="${resort.reviewCount} reviews">
            <span class="rating-word">${ratingWord(resort.rating)}</span>
            <span class="rating-score">${resort.rating.toFixed(1)}</span>
          </div>
        </div>
        <p class="resort-desc">${escapeHtml(resort.description)}</p>
        <div class="facility-chips">${facilityChips}</div>
        <p class="resort-meta-line">
          <span><i class="fa-solid fa-door-open" aria-hidden="true"></i> ${resort.roomCount} room types</span>
          ${resort.freeCancellation ? `<span class="ok"><i class="fa-solid fa-check" aria-hidden="true"></i> Free cancellation</span>` : ""}
          ${resort.breakfast ? `<span class="ok"><i class="fa-solid fa-mug-saucer" aria-hidden="true"></i> Breakfast options</span>` : ""}
        </p>
        <div class="resort-card-foot">
          <div class="resort-price">
            <span class="price-label">From</span>
            ${typeof resortPriceFromHtml === "function" ? resortPriceFromHtml(resort) : `<div class="price-row"><strong class="price-value">${money(resort.priceFrom)}</strong><span class="price-unit">/ night</span></div>`}
            <span class="price-tax">+ taxes &amp; fees</span>
          </div>
          <div class="resort-actions">
            <a class="btn btn-outline" href="resortdetail.html?${q}">View Rooms</a>
            <a class="btn btn-primary" href="resortdetail.html?${q}#rooms">Book Now</a>
          </div>
        </div>
      </div>
    </article>`;
}

/* ===================== RESULTS PAGE ===================== */

const RESORT_TYPES = ["Beachfront", "Riverside", "Island", "Mountain"];
let resortsShown = 6;

function buildFilterPanel(ctx) {
  const panel = document.getElementById("filterPanel");
  if (!panel) return;
  const facilities = GuestAPI.catalog.facilities();
  panel.innerHTML = `
    <div class="filter-block">
      <div class="filter-head">
        <h3>Filters</h3>
        <button type="button" class="link-btn" id="clearResortFilters">Clear all</button>
      </div>
    </div>
    <div class="filter-block">
      <h4>Your budget (per night)</h4>
      <input type="range" id="resortPrice" min="50" max="350" step="10" value="350" aria-label="Maximum price per night">
      <div class="range-value">Up to <strong id="resortPriceLabel">${money(350)}</strong></div>
    </div>
    <div class="filter-block">
      <h4>Guest rating</h4>
      ${[4.5, 4.0, 3.5]
        .map(
          (r) => `<label class="check-line"><input type="radio" name="minRating" value="${r}"> ${r}+ ${ratingWord(r)}</label>`
        )
        .join("")}
      <label class="check-line"><input type="radio" name="minRating" value="0" checked> Any rating</label>
    </div>
    <div class="filter-block">
      <h4>Resort type</h4>
      ${RESORT_TYPES.map(
        (t) => `<label class="check-line"><input type="checkbox" class="f-type" value="${t}"> ${t}</label>`
      ).join("")}
    </div>
    <div class="filter-block">
      <h4>Facilities</h4>
      ${facilities
        .map(
          (f) => `<label class="check-line"><input type="checkbox" class="f-facility" value="${f.id}"><i class="fa-solid ${f.icon} facility-ic" aria-hidden="true"></i> ${escapeHtml(f.name)}</label>`
        )
        .join("")}
    </div>
    <div class="filter-block">
      <h4>Popular filters</h4>
      <label class="check-line"><input type="checkbox" id="fFreeCancel"> Free cancellation</label>
      <label class="check-line"><input type="checkbox" id="fBreakfast"> Breakfast included</label>
    </div>`;

  panel.querySelectorAll("input").forEach((el) => {
    el.addEventListener("change", () => {
      resortsShown = 6;
      renderResortResults(ctx);
    });
  });
  const price = document.getElementById("resortPrice");
  price?.addEventListener("input", () => {
    document.getElementById("resortPriceLabel").textContent = money(Number(price.value));
    resortsShown = 6;
    renderResortResults(ctx);
  });
  document.getElementById("clearResortFilters")?.addEventListener("click", () => {
    panel.querySelectorAll("input[type=checkbox]").forEach((c) => (c.checked = false));
    const any = panel.querySelector('input[name=minRating][value="0"]');
    if (any) any.checked = true;
    if (price) {
      price.value = 350;
      document.getElementById("resortPriceLabel").textContent = money(350);
    }
    resortsShown = 6;
    renderResortResults(ctx);
  });
}

function readResortFilters() {
  const price = Number(document.getElementById("resortPrice")?.value || 350);
  const minRating = Number(document.querySelector("input[name=minRating]:checked")?.value || 0);
  const types = [...document.querySelectorAll(".f-type:checked")].map((c) => c.value);
  const facilities = [...document.querySelectorAll(".f-facility:checked")].map((c) => c.value);
  return {
    price,
    minRating,
    types,
    facilities,
    freeCancel: document.getElementById("fFreeCancel")?.checked || false,
    breakfast: document.getElementById("fBreakfast")?.checked || false
  };
}

function filteredResorts(ctx) {
  const f = readResortFilters();
  const term = ctx.destination.trim().toLowerCase();
  let list = GuestAPI.catalog.resorts();
  list = list.filter((r) => {
    const matchTerm =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.city.toLowerCase().includes(term) ||
      r.country.toLowerCase().includes(term) ||
      r.type.toLowerCase().includes(term);
    const matchId = !ctx.resortId || r.id === ctx.resortId;
    const matchPrice = r.priceFrom <= f.price;
    const matchRating = r.rating >= f.minRating;
    const matchType = !f.types.length || f.types.includes(r.type);
    const matchFacility = !f.facilities.length || f.facilities.every((fid) => r.facilities.includes(fid));
    const matchCancel = !f.freeCancel || r.freeCancellation;
    const matchBreakfast = !f.breakfast || r.breakfast;
    return matchTerm && matchId && matchPrice && matchRating && matchType && matchFacility && matchCancel && matchBreakfast;
  });

  const sort = document.getElementById("sortSelect")?.value || "recommended";
  if (sort === "price-asc") list.sort((a, b) => a.priceFrom - b.priceFrom);
  else if (sort === "price-desc") list.sort((a, b) => b.priceFrom - a.priceFrom);
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  else if (sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
  else list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  return list;
}

function renderResortResults(ctx) {
  const root = document.getElementById("resortResults");
  const empty = document.getElementById("resortEmpty");
  const more = document.getElementById("loadMoreResorts");
  const summary = document.getElementById("resultsSummary");
  if (!root) return;
  const list = filteredResorts(ctx);

  if (summary) {
    const where = ctx.destination ? ` in “${escapeHtml(ctx.destination)}”` : "";
    summary.innerHTML = `<strong>${list.length}</strong> resort${list.length === 1 ? "" : "s"} found${where} · ${escapeHtml(ctx.checkIn)} → ${escapeHtml(ctx.checkOut)} · ${ctx.adults + ctx.children} guest(s), ${ctx.rooms} room(s)`;
  }

  if (!list.length) {
    root.innerHTML = "";
    if (empty) {
      const catalog = GuestAPI.catalog.resorts();
      const filtered = readResortFilters();
      const hasActiveFilters =
        ctx.destination.trim() ||
        ctx.resortId ||
        filtered.types.length ||
        filtered.facilities.length ||
        filtered.freeCancel ||
        filtered.breakfast ||
        filtered.minRating > 0 ||
        filtered.price < 350;
      const apiEmpty = typeof GuestRemote !== "undefined" && GuestRemote.usingApi() && catalog.length === 0;
      const title = apiEmpty
        ? "No resorts available yet"
        : hasActiveFilters
          ? "No resorts match your filters"
          : "No resorts available yet";
      const detail = apiEmpty
        ? "Resorts will appear here once they are published from the management dashboard."
        : hasActiveFilters
          ? "Try widening your budget, removing facility filters, or searching a different destination."
          : "Check back soon or contact us for availability.";
      empty.querySelector("h3").textContent = title;
      empty.querySelector("p").textContent = detail;
      empty.hidden = false;
    }
    if (more) more.hidden = true;
    return;
  }
  if (empty) empty.hidden = true;
  const shown = list.slice(0, resortsShown);
  root.innerHTML = shown.map((r) => resortCardMarkup(r, ctx)).join("");
  if (more) more.hidden = shown.length >= list.length;
}

function initResortsPage() {
  const root = document.getElementById("resortResults");
  if (!root) return;
  const ctx = searchContext();

  if (typeof SearchWidget !== "undefined") {
    SearchWidget.render("resortsSearch", {
      values: ctx,
      onSubmit: (data) => {
        location.href = `resorts.html?${new URLSearchParams(data).toString()}`;
      }
    });
  }

  buildFilterPanel(ctx);
  document.getElementById("sortSelect")?.addEventListener("change", () => {
    resortsShown = 6;
    renderResortResults(ctx);
  });
  document.getElementById("loadMoreResorts")?.addEventListener("click", () => {
    resortsShown += 6;
    renderResortResults(ctx);
  });
  document.getElementById("toggleFilters")?.addEventListener("click", () => {
    document.getElementById("filterPanel")?.classList.toggle("open");
  });

  renderResortResults(ctx);
}

/* ===================== DETAIL PAGE ===================== */

function roomTypeRow(room, ctx) {
  const amen = (room.amenities || [])
    .slice(0, 4)
    .map((a) => `<span class="amen-pill">${escapeHtml(a)}</span>`)
    .join("");
  const q = contextQuery(ctx, { room: room.id });
  const lowStock = room.roomsLeft <= 3;
  return `
    <article class="roomtype-row">
      <div class="roomtype-media">
        <img src="${room.images[0]}" alt="${escapeHtml(room.name)}" loading="lazy">
      </div>
      <div class="roomtype-info">
        <h3>${escapeHtml(room.name)}</h3>
        <p class="roomtype-facts">
          <span><i class="fa-solid fa-user-group" aria-hidden="true"></i> ${room.capacity} guests</span>
          <span><i class="fa-solid fa-bed" aria-hidden="true"></i> ${escapeHtml(room.bedType)}</span>
          <span><i class="fa-solid fa-ruler-combined" aria-hidden="true"></i> ${escapeHtml(room.size)}</span>
        </p>
        <div class="amen-pills">${amen}</div>
        <p class="roomtype-tags">
          ${room.breakfastIncluded ? `<span class="tag-ok"><i class="fa-solid fa-check"></i> Breakfast included</span>` : `<span class="tag-muted">Breakfast available</span>`}
          ${room.freeCancellation ? `<span class="tag-ok"><i class="fa-solid fa-check"></i> Free cancellation</span>` : `<span class="tag-muted">Non-refundable</span>`}
        </p>
      </div>
      <div class="roomtype-buy">
        ${lowStock ? `<p class="low-stock">Only ${room.roomsLeft} left!</p>` : ""}
        <p class="roomtype-price room-price">${roomPriceHtml(room, " / night")}</p>
        <p class="price-tax">+ taxes &amp; fees</p>
        <a class="btn btn-primary" href="booking.html?${q}">Select Room</a>
        <a class="btn btn-ghost" href="roomdetail.html?id=${encodeURIComponent(room.id)}">Details</a>
      </div>
    </article>`;
}

function initResortDetailPage() {
  const wrap = document.getElementById("resortDetail");
  if (!wrap) return;
  const ctx = searchContext();
  const id = new URLSearchParams(location.search).get("id");
  const resort = GuestAPI.catalog.resortById(id);
  if (!resort) {
    wrap.innerHTML = emptyState("Resort not found", "Pick a resort from the results page.", "resorts.html", "Browse resorts");
    return;
  }

  const facilities = resort.facilities
    .map((fid) => {
      const f = GuestAPI.catalog.facility(fid);
      return `<li><i class="fa-solid ${f.icon}" aria-hidden="true"></i> ${escapeHtml(f.name)}</li>`;
    })
    .join("");

  // Aggregate a few guest reviews from the resort's rooms.
  const reviews = resort.rooms
    .flatMap((r) => (r.reviews || []).map((rev) => ({ ...rev, room: r.name })))
    .slice(0, 6);

  const gallery = resort.gallery;

  wrap.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="resorts.html?${contextQuery(ctx)}">Resorts</a> <span>/</span> <span>${escapeHtml(resort.name)}</span>
    </nav>

    <div class="resort-gallery">
      <div class="gallery-main">
        <button type="button" class="gallery-nav prev" id="rPrev" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
        <img id="rMain" src="${gallery[0]}" alt="${escapeHtml(resort.name)}">
        <button type="button" class="gallery-nav next" id="rNext" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="gallery-thumbs">
        ${gallery.map((src, i) => `<img src="${src}" alt="" class="${i === 0 ? "active" : ""}" data-index="${i}">`).join("")}
      </div>
    </div>

    <div class="resort-headline">
      <div>
        <h1>${escapeHtml(resort.name)} ${starIcons(resort.stars)}</h1>
        <p class="resort-loc"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(resort.address)}</p>
      </div>
      <div class="rating-pill lg" title="${resort.reviewCount} reviews">
        <div><span class="rating-word">${ratingWord(resort.rating)}</span><span class="rating-sub">${resort.reviewCount} reviews</span></div>
        <span class="rating-score">${resort.rating.toFixed(1)}</span>
      </div>
    </div>

    <div class="resort-detail-grid">
      <div class="resort-detail-main">
        <section class="info-card">
          <h2>About this resort</h2>
          <p>${escapeHtml(resort.description)}</p>
          <h3>Facilities</h3>
          <ul class="facilities-list">${facilities}</ul>
          <h3>Location</h3>
          <p class="resort-loc"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i> ${escapeHtml(resort.address)}</p>
          <div class="map-placeholder"><i class="fa-solid fa-map" aria-hidden="true"></i> Map preview (${escapeHtml(resort.city)})</div>
        </section>

        <section class="info-card" id="rooms">
          <h2>Choose your room</h2>
          <form class="date-strip" id="detailDates">
            <div><label>Check-in</label><input class="field" type="date" name="checkIn" value="${escapeHtml(ctx.checkIn)}"></div>
            <div><label>Check-out</label><input class="field" type="date" name="checkOut" value="${escapeHtml(ctx.checkOut)}"></div>
            <div><label>Adults</label><input class="field" type="number" name="adults" min="1" value="${ctx.adults}"></div>
            <div><label>Children</label><input class="field" type="number" name="children" min="0" value="${ctx.children}"></div>
          </form>
          <div class="roomtype-list" id="roomTypeList"></div>
        </section>

        <section class="info-card">
          <h2>Guest reviews</h2>
          <div class="rating-summary">
            <span class="stars">${"★".repeat(Math.round(resort.rating))}</span>
            <strong>${resort.rating.toFixed(1)} / 5</strong>
            <span>${resort.reviewCount} reviews</span>
          </div>
          <div class="review-list">
            ${reviews
              .map(
                (rev) => `<article class="review-card">
                  <div class="review-head"><strong>${escapeHtml(rev.name)}</strong><span class="stars">${"★".repeat(rev.stars)}</span></div>
                  <p>${escapeHtml(rev.text)}</p>
                  <p class="hint">${escapeHtml(rev.room)}</p>
                </article>`
              )
              .join("")}
          </div>
        </section>
      </div>

      <aside class="resort-detail-aside">
        <div class="book-cta-card">
          <p class="price-label">From</p>
          <div class="cta-price resort-price">${typeof resortPriceFromHtml === "function" ? resortPriceFromHtml(resort) : `<div class="price-row"><strong class="price-value">${money(resort.priceFrom)}</strong><span class="price-unit">/ night</span></div>`}</div>
          <p class="price-tax">+ taxes &amp; fees</p>
          <a class="btn btn-primary" href="#rooms">See available rooms</a>
          <ul class="cta-points">
            ${resort.freeCancellation ? `<li><i class="fa-solid fa-check"></i> Free cancellation options</li>` : ""}
            ${resort.breakfast ? `<li><i class="fa-solid fa-check"></i> Breakfast available</li>` : ""}
            <li><i class="fa-solid fa-check"></i> Reserve now, pay your way</li>
          </ul>
        </div>
      </aside>
    </div>

    <div class="modal" id="resortPhotoModal"><img id="resortPhotoModalImg" alt=""></div>
  `;

  // Gallery interactions
  let index = 0;
  const main = document.getElementById("rMain");
  const setImage = (i) => {
    index = (i + gallery.length) % gallery.length;
    main.src = gallery[index];
    wrap.querySelectorAll(".gallery-thumbs img").forEach((el, n) => el.classList.toggle("active", n === index));
  };
  document.getElementById("rPrev")?.addEventListener("click", () => setImage(index - 1));
  document.getElementById("rNext")?.addEventListener("click", () => setImage(index + 1));
  wrap.querySelectorAll(".gallery-thumbs img").forEach((img) => img.addEventListener("click", () => setImage(Number(img.dataset.index))));
  main?.addEventListener("click", () => {
    const modal = document.getElementById("resortPhotoModal");
    document.getElementById("resortPhotoModalImg").src = gallery[index];
    modal.classList.add("show");
  });
  document.getElementById("resortPhotoModal")?.addEventListener("click", () => document.getElementById("resortPhotoModal").classList.remove("show"));

  // Room grid, refreshed when dates/guests change
  const listEl = document.getElementById("roomTypeList");
  const dateForm = document.getElementById("detailDates");
  let roomLoadToken = 0;
  const drawRooms = () => {
    const data = Object.fromEntries(new FormData(dateForm).entries());
    const liveCtx = {
      ...ctx,
      ...data,
      adults: Number(data.adults) || 1,
      children: Number(data.children) || 0
    };
    const token = ++roomLoadToken;
    listEl.innerHTML = '<p class="hint">Loading rooms…</p>';

    const renderList = (rooms) => {
      if (token !== roomLoadToken) return;
      listEl.innerHTML = rooms.length
        ? rooms.map((r) => roomTypeRow(r, liveCtx)).join("")
        : emptyState(
            "No rooms available",
            "Add rooms in the dashboard for this resort, set status to available, and match your dates and guest count.",
            "resorts.html",
            "Back to resorts"
          );
    };

    const useLiveApi =
      typeof GuestRemote !== "undefined" &&
      GuestRemote.usingApi &&
      GuestRemote.usingApi();

    if (useLiveApi && id) {
      GuestAPI.resortRoomCards(id, {
        checkIn: liveCtx.checkIn,
        checkOut: liveCtx.checkOut,
        adults: liveCtx.adults,
        children: liveCtx.children
      })
        .then((rooms) => renderList(rooms))
        .catch(() => renderList(resort.rooms || []));
      return;
    }

    renderList(resort.rooms || []);
  };
  dateForm?.addEventListener("input", drawRooms);
  dateForm?.addEventListener("change", drawRooms);
  drawRooms();

  // Smooth-scroll to rooms if arriving with #rooms
  if (location.hash === "#rooms") {
    setTimeout(() => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" }), 150);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  GuestAPI.ready().finally(() => {
    initResortsPage();
    initResortDetailPage();
  });
});
