function params() {
  return new URLSearchParams(location.search);
}

function roomCard(room) {
  const amen = (room.amenities || []).slice(0, 3).join(" · ");
  const resort = typeof GuestAPI !== "undefined" ? GuestAPI.catalog.resortById(room.resortId) : null;
  return `
    <article class="room-card">
      <div class="room-card-media">
        <img src="${room.image}" alt="${escapeHtml(room.name)}">
      </div>
      <div class="card-body">
        <span class="room-tag">${escapeHtml(room.roomType)}</span>
        ${room.featured ? `<span class="room-tag featured">Featured</span>` : ""}
        <h3>${escapeHtml(room.name)}</h3>
        ${resort ? `<p class="amen-line"><i class="fa-solid fa-hotel" aria-hidden="true"></i> ${escapeHtml(resort.name)} · ${escapeHtml(resort.city)}</p>` : ""}
        <p>${escapeHtml(room.description)}</p>
        <div class="meta">
          <span><i class="fa-solid fa-user"></i> ${room.capacity}</span>
          <span><i class="fa-solid fa-bed"></i> ${escapeHtml(room.bedType)}</span>
          <span><i class="fa-solid fa-star"></i> ${room.rating} (${room.reviewCount})</span>
        </div>
        <p class="amen-line">${escapeHtml(amen)}</p>
        <p class="avail">${room.available ? "Available in catalogue" : "Not listed as available"}</p>
        <div class="room-foot">
          <strong>${money(room.pricePerNight)} / night</strong>
          <div class="room-actions">
            <a class="btn btn-outline" href="roomdetail.html?id=${encodeURIComponent(room.id)}">View details</a>
            <a class="btn btn-primary" href="booking.html?room=${encodeURIComponent(room.id)}">Book now</a>
          </div>
        </div>
      </div>
    </article>`;
}

function readFilters() {
  const q = params();
  const form = {
    search: document.getElementById("roomSearch")?.value || q.get("q") || "",
    checkIn: document.getElementById("filterCheckIn")?.value || q.get("checkIn") || "",
    checkOut: document.getElementById("filterCheckOut")?.value || q.get("checkOut") || "",
    adults: Number(document.getElementById("filterAdults")?.value || q.get("adults") || 0),
    children: Number(document.getElementById("filterChildren")?.value || q.get("children") || 0),
    type: document.getElementById("roomType")?.value || q.get("type") || "",
    minPrice: Number(document.getElementById("minPrice")?.value || 0),
    maxPrice: Number(document.getElementById("maxPrice")?.value || 9999),
    capacity: Number(document.getElementById("guestCount")?.value || 0),
    amenity: document.getElementById("amenityFilter")?.value || "",
    sort: document.getElementById("sortRooms")?.value || "featured",
    featured: document.getElementById("featuredOnly")?.checked || false
  };
  return form;
}

function applyRoomFilters() {
  const f = readFilters();
  let list = GuestAPI.catalog.rooms();
  const q = f.search.toLowerCase().trim();
  list = list.filter((room) => {
    const matchName = !q || room.name.toLowerCase().includes(q) || room.roomType.toLowerCase().includes(q) || room.code.toLowerCase().includes(q);
    const matchPrice = room.pricePerNight >= f.minPrice && room.pricePerNight <= f.maxPrice;
    const matchType = !f.type || room.roomType === f.type;
    const matchCap = !f.capacity || room.capacity >= f.capacity;
    const matchAdults = !f.adults || room.adults >= f.adults;
    const matchChildren = !f.children || room.children >= f.children;
    const matchAmenity = !f.amenity || room.amenities.some((a) => a === f.amenity);
    const matchFeatured = !f.featured || room.featured;
    const matchDates = !f.checkIn || !f.checkOut || GuestAPI.isRoomFree(room.id, f.checkIn, f.checkOut);
    return matchName && matchPrice && matchType && matchCap && matchAdults && matchChildren && matchAmenity && matchFeatured && matchDates;
  });
  if (f.sort === "price-asc") list.sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (f.sort === "price-desc") list.sort((a, b) => b.pricePerNight - a.pricePerNight);
  if (f.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}

let roomPageSize = 6;

function renderRooms() {
  const root = document.getElementById("roomGallery");
  const empty = document.getElementById("noResult");
  const more = document.getElementById("loadMore");
  if (!root) return;
  const list = applyRoomFilters();
  const shown = list.slice(0, roomPageSize);
  if (!list.length) {
    root.innerHTML = "";
    if (empty) empty.style.display = "block";
    if (more) more.hidden = true;
    return;
  }
  if (empty) empty.style.display = "none";
  root.innerHTML = shown.map(roomCard).join("");
  if (more) more.hidden = shown.length >= list.length;
}

function initRoomsPage() {
  const gallery = document.getElementById("roomGallery");
  if (!gallery) return;

  const q = params();
  const search = document.getElementById("roomSearch");
  const adults = document.getElementById("filterAdults");
  const children = document.getElementById("filterChildren");
  const checkIn = document.getElementById("filterCheckIn");
  const checkOut = document.getElementById("filterCheckOut");
  if (search && q.get("q")) search.value = q.get("q");
  if (adults && q.get("adults")) adults.value = q.get("adults");
  if (children && q.get("children")) children.value = q.get("children");
  if (checkIn && q.get("checkIn")) checkIn.value = q.get("checkIn");
  if (checkOut && q.get("checkOut")) checkOut.value = q.get("checkOut");

  const amenity = document.getElementById("amenityFilter");
  if (amenity) {
    const set = new Set();
    GuestAPI.catalog.rooms().forEach((r) => r.amenities.forEach((a) => set.add(a)));
    amenity.innerHTML = `<option value="">Any amenity</option>` + [...set].map((a) => `<option>${escapeHtml(a)}</option>`).join("");
  }

  const apply = () => renderRooms();
  ["roomSearch", "minPrice", "maxPrice", "guestCount", "roomType", "amenityFilter", "sortRooms", "filterAdults", "filterChildren", "filterCheckIn", "filterCheckOut"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", apply);
    document.getElementById(id)?.addEventListener("change", apply);
  });
  document.getElementById("featuredOnly")?.addEventListener("change", apply);
  document.getElementById("searchRoomBtn")?.addEventListener("click", apply);
  document.getElementById("loadMore")?.addEventListener("click", () => {
    roomPageSize += 6;
    apply();
  });
  document.getElementById("clearFilter")?.addEventListener("click", () => {
    document.getElementById("roomSearch").value = "";
    document.getElementById("minPrice").value = 0;
    document.getElementById("maxPrice").value = 300;
    document.getElementById("priceRange").value = 300;
    document.getElementById("guestCount").value = "0";
    document.getElementById("roomType").value = "";
    document.getElementById("amenityFilter").value = "";
    document.getElementById("sortRooms").value = "featured";
    document.getElementById("featuredOnly").checked = false;
    document.getElementById("filterAdults").value = "0";
    document.getElementById("filterChildren").value = "0";
    document.getElementById("filterCheckIn").value = "";
    document.getElementById("filterCheckOut").value = "";
    roomPageSize = 6;
    apply();
  });
  document.getElementById("priceRange")?.addEventListener("input", (e) => {
    const max = document.getElementById("maxPrice");
    if (max) max.value = e.target.value;
    apply();
  });
  apply();
}

function starRow(rating) {
  const value = Number(rating) || 0;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  let html = "";
  for (let i = 1; i <= 5; i += 1) {
    if (i <= full) html += '<i class="fa-solid fa-star"></i>';
    else if (i === full + 1 && half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return `<span class="stars" aria-label="${value} out of 5 stars">${html}</span>`;
}

function initRoomDetail() {
  const wrap = document.getElementById("roomDetail");
  if (!wrap) return;
  const id = params().get("id");
  const room = GuestAPI.catalog.room(id);
  if (!room) {
    wrap.innerHTML = emptyState("Room not found", "This room is not in the guest catalogue.", "room.html", "Back to rooms");
    return;
  }

  let index = 0;
  const gallery = room.gallery;
  const related = GuestAPI.catalog
    .rooms()
    .filter((r) => r.id !== room.id && (r.roomType === room.roomType || Math.abs(r.pricePerNight - room.pricePerNight) <= 30))
    .slice(0, 3);
  const q = params();

  wrap.innerHTML = `
    <div class="detail-gallery">
      <div class="gallery-main">
        <button type="button" class="gallery-nav prev" id="prevImg" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
        <img id="detailMain" src="${gallery[0]}" alt="${escapeHtml(room.name)}">
        <button type="button" class="gallery-nav next" id="nextImg" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="thumbs">${gallery.map((src, i) => `<img src="${src}" alt="" class="${i === 0 ? "active" : ""}" data-index="${i}">`).join("")}</div>
      <section class="room-story">
        <h2>More about this room</h2>
        <p class="story-copy">${escapeHtml(room.longDescription || room.description)}</p>
        <h3>Guest ratings</h3>
        <div class="rating-summary">
          ${starRow(room.rating)}
          <strong>${room.rating.toFixed(1)} / 5</strong>
          <span>${room.reviewCount} customer reviews</span>
        </div>
        <div class="review-list">
          ${(room.reviews || [])
            .map(
              (rev) => `<article class="review-card">
                <div class="review-head">
                  <strong>${escapeHtml(rev.name)}</strong>
                  ${starRow(rev.stars)}
                </div>
                <p>${escapeHtml(rev.text)}</p>
              </article>`
            )
            .join("")}
        </div>
      </section>
    </div>
    <div class="detail-copy">
      <span class="room-tag">${escapeHtml(room.roomType)}</span>
      <h1>${escapeHtml(room.name)}</h1>
      <p class="code-line">${escapeHtml(room.code)}</p>
      <div class="rating-line">
        ${starRow(room.rating)}
        <strong>${room.rating.toFixed(1)}</strong>
        <span>from ${room.reviewCount} guest ratings</span>
      </div>
      <p>${escapeHtml(room.description)}</p>
      <ul class="facts">
        <li><i class="fa-solid fa-tag"></i> ${money(room.pricePerNight)} per night</li>
        <li><i class="fa-solid fa-users"></i> Sleeps ${room.capacity} (${room.adults} adults, ${room.children} children)</li>
        <li><i class="fa-solid fa-bed"></i> ${escapeHtml(room.bedType)}</li>
        <li><i class="fa-solid fa-ruler-combined"></i> ${escapeHtml(room.size)}</li>
        <li><i class="fa-solid fa-circle-check"></i> ${room.available ? "Listed as available" : "Not available"}</li>
      </ul>
      <h3>Amenities</h3>
      <ul class="amen-list">${room.amenities.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
      <form class="booking-widget" id="detailBook">
        <h3>Reserve these dates</h3>
        <label>Check-in</label>
        <input class="field" type="date" name="checkIn" value="${escapeHtml(q.get("checkIn") || "")}" required>
        <label>Check-out</label>
        <input class="field" type="date" name="checkOut" value="${escapeHtml(q.get("checkOut") || "")}" required>
        <div class="form-row">
          <div><label>Adults</label><input class="field" type="number" name="adults" min="1" value="${escapeHtml(q.get("adults") || "1")}"></div>
          <div><label>Children</label><input class="field" type="number" name="children" min="0" value="${escapeHtml(q.get("children") || "0")}"></div>
        </div>
        <button class="btn btn-primary" type="submit">Continue to booking</button>
      </form>
    </div>
    <div class="related" style="grid-column:1/-1">
      <h2>Related rooms</h2>
      <div class="room-gallery">${related.map(roomCard).join("") || "<p class='lead'>No related rooms.</p>"}</div>
    </div>
    <div class="modal" id="photoModal"><img id="photoModalImg" alt=""></div>
  `;

  const setImage = (i) => {
    index = (i + gallery.length) % gallery.length;
    document.getElementById("detailMain").src = gallery[index];
    wrap.querySelectorAll(".thumbs img").forEach((el, n) => el.classList.toggle("active", n === index));
  };

  document.getElementById("prevImg")?.addEventListener("click", () => setImage(index - 1));
  document.getElementById("nextImg")?.addEventListener("click", () => setImage(index + 1));
  wrap.querySelectorAll(".thumbs img").forEach((img) => {
    img.addEventListener("click", () => setImage(Number(img.dataset.index)));
  });
  document.getElementById("detailMain")?.addEventListener("click", () => {
    const modal = document.getElementById("photoModal");
    document.getElementById("photoModalImg").src = gallery[index];
    modal.classList.add("show");
  });
  document.getElementById("photoModal")?.addEventListener("click", () => document.getElementById("photoModal").classList.remove("show"));

  document.getElementById("detailBook")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const quote = GuestAPI.quote({ roomId: room.id, ...data });
    if (quote.errors.length) {
      toast(quote.errors[0]);
      return;
    }
    const qs = new URLSearchParams({ room: room.id, ...data });
    location.href = `booking.html?${qs.toString()}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRoomsPage();
  initRoomDetail();
});
