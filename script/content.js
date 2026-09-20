function initContentPages() {
  const page = document.body.dataset.page;

  if (page === "home") {
    // Agoda-style hero search + popular destinations + popular resorts
    if (typeof SearchWidget !== "undefined") SearchWidget.render("heroSearch");
    const chips = document.getElementById("popularDestinations");
    if (chips) {
      const cities = [...new Set(GuestAPI.catalog.resorts().map((r) => r.city))].slice(0, 6);
      chips.innerHTML =
        `<span class="popular-chips-label">Popular:</span>` +
        cities
          .map((c) => `<a class="chip" href="resorts.html?destination=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`)
          .join("");
    }
    const popular = document.getElementById("popularResorts");
    if (popular && typeof resortCardMarkup === "function") {
      popular.innerHTML = GuestAPI.catalog
        .resorts()
        .filter((r) => r.featured)
        .slice(0, 3)
        .map((r) => resortCardMarkup(r))
        .join("");
    }

    const acts = document.getElementById("homeActivities");
    const rooms = document.getElementById("homeRooms");
    const services = document.getElementById("homeServices");
    const dining = document.getElementById("homeDining");
    const gallery = document.getElementById("homeGallery");
    const promo = document.getElementById("homePromo");
    const quotes = document.getElementById("homeQuotes");
    if (acts) {
      acts.innerHTML = GuestAPI.catalog
        .activities()
        .slice(0, 3)
        .map(
          (a) => `<article class="card overlay-card">
            <img src="${a.image}" alt="${escapeHtml(a.name)}">
            <div class="caption"><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.description)}</p></div>
          </article>`
        )
        .join("");
    }
    if (rooms) {
      rooms.innerHTML = GuestAPI.catalog
        .rooms()
        .filter((r) => r.featured)
        .slice(0, 4)
        .map(
          (r) => `<article class="card room-mini">
            <img src="${r.image}" alt="${escapeHtml(r.name)}">
            <div class="card-body">
              <h3>${escapeHtml(r.name)}</h3>
              <p class="price">${money(r.pricePerNight)} / night</p>
              <a class="btn btn-primary" href="roomdetail.html?id=${encodeURIComponent(r.id)}">View details</a>
            </div>
          </article>`
        )
        .join("");
    }
    if (services) {
      services.innerHTML = GuestAPI.catalog
        .services()
        .slice(0, 4)
        .map(
          (s) => `<article class="service-card">
            <i class="fa-solid ${s.icon}" aria-hidden="true"></i>
            <h3>${escapeHtml(s.name)}</h3>
            <p>${escapeHtml(s.description)}</p>
          </article>`
        )
        .join("");
    }
    if (dining) {
      const items = GuestAPI.catalog.dining().categories[0].items.slice(0, 3);
      dining.innerHTML = items
        .map(
          (i) => `<article class="card"><img src="${i.image}" alt="${escapeHtml(i.name)}"><div class="card-body"><h3>${escapeHtml(i.name)}</h3><p>${money(i.price)}</p></div></article>`
        )
        .join("");
    }
    if (gallery) {
      gallery.innerHTML = GuestAPI.catalog
        .gallery()
        .slice(0, 4)
        .map((g) => `<a href="gallery.html"><img src="${g.image}" alt="${escapeHtml(g.title)}"></a>`)
        .join("");
    }
    if (promo) {
      const offer = GuestAPI.catalog.promotions()[0];
      promo.innerHTML = `<h2>${escapeHtml(offer.headline)}</h2><p>${escapeHtml(offer.detail)}</p><p>Use code <strong>${escapeHtml(offer.code)}</strong></p><a class="btn btn-gold" href="booking.html?room=junior-villa&promo=SOLARA10">Book with SOLARA10</a>`;
    }
    if (quotes) {
      quotes.innerHTML = GuestAPI.catalog
        .testimonials()
        .map((t) => `<article class="card pad"><p>“${escapeHtml(t.quote)}”</p><p><strong>${escapeHtml(t.name)}</strong> · ${t.rating}/5</p></article>`)
        .join("");
    }
  }

  if (page === "activities") {
    const root = document.getElementById("activityGrid");
    const detail = document.getElementById("activityDetail");
    const id = new URLSearchParams(location.search).get("id");
    const selected = id ? GuestAPI.catalog.activity(id) : null;
    const cat = document.getElementById("activityCat");
    const draw = () => {
      const filter = cat?.value || "";
      const list = GuestAPI.catalog.activities().filter((a) => !filter || a.category === filter);
      if (root) {
        root.innerHTML = list
          .map(
            (a) => `<article class="card">
              <img src="${a.image}" alt="${escapeHtml(a.name)}">
              <div class="card-body">
                <h3>${escapeHtml(a.name)}</h3>
                <p>${escapeHtml(a.description)}</p>
                <p>${escapeHtml(a.duration)} · ${a.price ? money(a.price) : "Included"} · ${escapeHtml(a.location)}</p>
                <a class="btn btn-outline" href="activities.html?id=${encodeURIComponent(a.id)}">Details</a>
              </div>
            </article>`
          )
          .join("");
      }
    };
    if (cat) {
      const cats = [...new Set(GuestAPI.catalog.activities().map((a) => a.category))];
      cat.innerHTML = `<option value="">All categories</option>` + cats.map((c) => `<option>${escapeHtml(c)}</option>`).join("");
      cat.addEventListener("change", draw);
    }
    draw();
    if (detail && selected) {
      detail.innerHTML = `<article class="card pad"><h2>${escapeHtml(selected.name)}</h2><p>${escapeHtml(selected.description)}</p><p>${escapeHtml(selected.availability)}</p><a class="btn btn-primary" href="contact.html">Ask to book this activity</a></article>`;
    } else if (detail && id) {
      detail.innerHTML = emptyState("Activity not found", "Choose an experience from the list.", "activities.html", "All activities");
    }
  }

  if (page === "services") {
    const root = document.getElementById("serviceGrid");
    if (root) {
      root.innerHTML = GuestAPI.catalog
        .services()
        .map(
          (s) => `<article class="service-card">
            <span class="service-icon"><i class="fa-solid ${s.icon}" aria-hidden="true"></i></span>
            <h3>${escapeHtml(s.name)}</h3>
            <p>${escapeHtml(s.description)}</p>
            <p class="price">${s.price ? money(s.price) : "Included"}</p>
            <div class="btn-row" style="justify-content:center">
              <a class="btn btn-primary" href="room.html">Book a room</a>
              <a class="btn btn-ghost" href="contact.html">Enquire</a>
            </div>
          </article>`
        )
        .join("");
    }
  }

  if (page === "dining") {
    const root = document.getElementById("menuGrid");
    const info = document.getElementById("diningInfo");
    const dining = GuestAPI.catalog.dining();
    if (info) info.innerHTML = `<h2>${escapeHtml(dining.restaurant.name)}</h2><p class="lead">${escapeHtml(dining.restaurant.description)}</p><p class="lead">${escapeHtml(dining.restaurant.hours)}</p>`;
    const draw = () => {
      const cat = document.getElementById("menuCat")?.value || "";
      const groups = dining.categories.filter((g) => !cat || g.id === cat);
      if (root) {
        root.innerHTML = groups
          .map(
            (group) => `<article class="card"><div class="card-body">
              <h3>${escapeHtml(group.name)}</h3>
              ${group.items
                .map(
                  (i) => `<div class="menu-line">
                    <div><strong>${escapeHtml(i.name)}</strong><p>${escapeHtml(i.description)}</p><p>${i.available ? "Available" : "Not available today"}</p></div>
                    <strong>${money(i.price)}</strong>
                  </div>`
                )
                .join("")}
            </div></article>`
          )
          .join("");
      }
    };
    const cat = document.getElementById("menuCat");
    if (cat) {
      cat.innerHTML = `<option value="">All menus</option>` + dining.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
      cat.addEventListener("change", draw);
    }
    draw();
  }

  if (page === "gallery") {
    const root = document.getElementById("galleryGrid");
    const modal = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const cat = document.getElementById("galleryCat");
    const items = GuestAPI.catalog.gallery();
    const draw = () => {
      const filter = cat?.value || "";
      const list = items.filter((g) => !filter || g.category === filter);
      if (root) {
        root.innerHTML = list.map((g) => `<img src="${g.image}" alt="${escapeHtml(g.title)}" data-src="${g.image}">`).join("");
        root.querySelectorAll("img").forEach((el) => {
          el.addEventListener("click", () => {
            img.src = el.dataset.src;
            modal.classList.add("show");
          });
        });
      }
    };
    if (cat) {
      const cats = [...new Set(items.map((g) => g.category))];
      cat.innerHTML = `<option value="">All</option>` + cats.map((c) => `<option>${escapeHtml(c)}</option>`).join("");
      cat.addEventListener("change", draw);
    }
    modal?.addEventListener("click", () => modal.classList.remove("show"));
    draw();
  }

  if (page === "about") {
    const team = document.getElementById("teamGrid");
    const story = document.getElementById("aboutStory");
    if (story) {
      story.innerHTML = `<h2 style="text-align:left">Our story</h2><p>${escapeHtml(SolaraData.about.story)}</p><h3>Mission</h3><p>${escapeHtml(SolaraData.about.mission)}</p><h3>Values</h3><ul>${SolaraData.about.values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>`;
    }
    if (team) {
      team.innerHTML = GuestAPI.catalog
        .team()
        .map(
          (m) => `<article class="card team">
            <img src="${m.image}" alt="${escapeHtml(m.name)}">
            <div class="card-body"><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.position)}</p><p>${escapeHtml(m.description)}</p></div>
          </article>`
        )
        .join("");
    }
  }
}

document.addEventListener("DOMContentLoaded", initContentPages);
