function bookingInput() {
  return {
    roomId: document.getElementById("roomId")?.value,
    checkIn: document.getElementById("checkIn")?.value,
    checkOut: document.getElementById("checkOut")?.value,
    adults: document.getElementById("adults")?.value,
    children: document.getElementById("children")?.value,
    promo: document.getElementById("promo")?.value,
    guestName: document.querySelector("[name=guestName]")?.value,
    email: document.querySelector("[name=email]")?.value,
    phone: document.querySelector("[name=phone]")?.value,
    note: document.querySelector("[name=note]")?.value
  };
}

function renderSummary() {
  const box = document.getElementById("bookingSummary");
  if (!box) return;
  const q = GuestAPI.quote(bookingInput());
  if (!q.room) {
    box.innerHTML = emptyState("Choose a room", "Select a room to see stay pricing.", "room.html", "Browse rooms");
    return;
  }
  const err = q.errors.map((e) => `<p class="form-error">${escapeHtml(e)}</p>`).join("");
  box.innerHTML = `
    <img src="${q.room.image}" alt="${escapeHtml(q.room.name)}">
    <h3>${escapeHtml(q.room.name)}</h3>
    <p>${escapeHtml(q.room.code)} · ${escapeHtml(q.room.roomType)}</p>
    <p>${q.checkIn || "—"} → ${q.checkOut || "—"}</p>
    <p>${q.nights || 0} night(s) · ${q.adults} adult(s) · ${q.children} child(ren)</p>
    <p>Room ${money(q.room.pricePerNight)} × ${q.nights || 0}</p>
    <p>Subtotal: ${money(q.subtotal)}</p>
    <p>Discount${q.promo ? ` (${escapeHtml(q.promo)})` : ""}: − ${money(q.discount)}</p>
    <p>After promo: ${money(q.afterDiscount)}</p>
    <p>Service charge (10%): ${money(q.serviceCharge)}</p>
    <p>Tax (10%): ${money(q.tax)}</p>
    <p><strong>Total: ${money(q.total)}</strong></p>
    ${err}
    <p class="hint">Demo only. Totals are calculated in the browser. No payment is taken and no hotel PMS is updated.</p>
  `;
}

function defaultDates() {
  const inEl = document.getElementById("checkIn");
  const outEl = document.getElementById("checkOut");
  if (!inEl || inEl.value) return;
  const today = new Date();
  const next = new Date(today);
  next.setDate(today.getDate() + 1);
  const fmt = (d) => d.toISOString().slice(0, 10);
  inEl.value = fmt(today);
  outEl.value = fmt(next);
}

function fillRoomSelect(selected) {
  const select = document.getElementById("roomId");
  if (!select) return;
  select.innerHTML = GuestAPI.catalog
    .rooms()
    .map((r) => `<option value="${r.id}" ${r.id === selected ? "selected" : ""}>${escapeHtml(r.name)} — ${money(r.pricePerNight)}</option>`)
    .join("");
}

function bookingReturnUrl() {
  const params = new URLSearchParams(location.search);
  const page = `booking.html${params.toString() ? `?${params.toString()}` : ""}`;
  return `login.html?next=${encodeURIComponent(page)}`;
}

function showReview(quote, data) {
  const review = document.getElementById("reviewPanel");
  const form = document.getElementById("bookingForm");
  if (!review || !form) return;
  form.hidden = true;
  review.hidden = false;
  review.innerHTML = `
    <h2>Review booking</h2>
    <p>Check the stay before you save it to this browser. No payment will be processed.</p>
    <ul class="facts">
      <li><strong>Guest:</strong> ${escapeHtml(data.guestName)} · ${escapeHtml(data.email)}</li>
      <li><strong>Room:</strong> ${escapeHtml(quote.room.name)}</li>
      <li><strong>Stay:</strong> ${escapeHtml(quote.checkIn)} → ${escapeHtml(quote.checkOut)} (${quote.nights} nights)</li>
      <li><strong>Guests:</strong> ${quote.adults} adults, ${quote.children} children</li>
      <li><strong>After promo:</strong> ${money(quote.afterDiscount)}</li>
      <li><strong>Total including tax & service:</strong> ${money(quote.total)}</li>
    </ul>
    <div class="btn-row">
      <button class="btn btn-outline" type="button" id="editBooking">Edit</button>
      <button class="btn btn-primary" type="button" id="confirmBooking">Confirm reservation</button>
    </div>
  `;
  document.getElementById("editBooking")?.addEventListener("click", () => {
    review.hidden = true;
    form.hidden = false;
  });
  document.getElementById("confirmBooking")?.addEventListener("click", () => {
    if (!GuestAPI.auth.session()) {
      toast("Login or register to complete this booking.");
      location.href = bookingReturnUrl();
      return;
    }
    const result = GuestAPI.bookings.create(data);
    if (!result.ok) {
      toast(result.errors[0] || result.error);
      review.hidden = true;
      form.hidden = false;
      renderSummary();
      return;
    }
    location.href = "booking-confirm.html";
  });
}

function initBookingPage() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const q = new URLSearchParams(location.search);
  const session = GuestAPI.auth.session();
  fillRoomSelect(q.get("room") || "junior-villa");
  if (q.get("checkIn")) document.getElementById("checkIn").value = q.get("checkIn");
  if (q.get("checkOut")) document.getElementById("checkOut").value = q.get("checkOut");
  if (q.get("adults")) document.getElementById("adults").value = q.get("adults");
  if (q.get("children")) document.getElementById("children").value = q.get("children");
  if (q.get("promo")) document.getElementById("promo").value = q.get("promo");
  if (session) {
    form.guestName.value = session.name || "";
    form.email.value = session.email || "";
    form.phone.value = session.phone || "";
  } else {
    const note = document.createElement("p");
    note.className = "form-error";
    note.innerHTML = `A guest account is required to book. <a href="${bookingReturnUrl()}">Login</a> or <a href="register.html?next=${encodeURIComponent("booking.html" + (location.search || ""))}">Register</a>.`;
    form.prepend(note);
  }
  defaultDates();
  renderSummary();
  ["roomId", "checkIn", "checkOut", "adults", "children", "promo"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderSummary);
    document.getElementById(id)?.addEventListener("change", renderSummary);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!GuestAPI.auth.session()) {
      toast("Login or register to book a room.");
      location.href = bookingReturnUrl();
      return;
    }
    const data = { ...bookingInput(), ...Object.fromEntries(new FormData(form).entries()) };
    if (!data.guestName || !data.email) {
      toast("Guest name and email are required.");
      return;
    }
    const quote = GuestAPI.quote(data);
    if (quote.errors.length) {
      toast(quote.errors[0]);
      renderSummary();
      return;
    }
    showReview(quote, data);
  });
}

function initConfirmPage() {
  const root = document.getElementById("confirmRoot");
  if (!root) return;
  let booking = null;
  try {
    booking = JSON.parse(sessionStorage.getItem("solara_last_booking") || "null");
  } catch {
    booking = null;
  }
  if (!booking) {
    root.innerHTML = emptyState("No booking found", "Start a reservation from the rooms page.", "booking.html", "Start again");
    return;
  }
  root.innerHTML = `
    <div class="auth-card confirm-card">
      <p class="success-pill">Reservation saved on this device</p>
      <h1>Booking ${escapeHtml(booking.code)}</h1>
      <p>This is not a payment confirmation. Staff tools and charging live in the internal RMS, not on this guest site.</p>
      <ul class="facts">
        <li><strong>Guest:</strong> ${escapeHtml(booking.guestName)}</li>
        <li><strong>Room:</strong> ${escapeHtml(booking.roomName)}</li>
        <li><strong>Stay:</strong> ${escapeHtml(booking.checkIn)} → ${escapeHtml(booking.checkOut)} (${booking.nights} nights)</li>
        <li><strong>Guests:</strong> ${booking.adults} adults, ${booking.children} children</li>
        <li><strong>Total:</strong> ${money(booking.total)}</li>
        <li><strong>Status:</strong> ${statusBadge(booking.status)}</li>
      </ul>
      <div class="btn-row">
        <a class="btn btn-primary" href="account-bookings.html">View my bookings</a>
        <a class="btn btn-ghost" href="home.html">Back home</a>
        <a class="btn btn-outline" href="contact.html">Contact resort</a>
        <button class="btn btn-outline" type="button" id="printConfirm">Print</button>
      </div>
    </div>`;
  document.getElementById("printConfirm")?.addEventListener("click", () => window.print());
}

document.addEventListener("DOMContentLoaded", () => {
  initBookingPage();
  initConfirmPage();
});
