/* ------------------------------------------------------------------ *
 * Booking step: selection recap + guest details, then hand off to
 * the payment page via a draft in localStorage.
 * ------------------------------------------------------------------ */

function bookingContext() {
  const q = new URLSearchParams(location.search);
  const today = new Date().toISOString().slice(0, 10);
  const checkIn = q.get("checkIn") || today;
  const next = new Date(checkIn);
  next.setDate(next.getDate() + 1);
  return {
    roomId: q.get("room") || "junior-villa",
    checkIn,
    checkOut: q.get("checkOut") || next.toISOString().slice(0, 10),
    adults: Math.max(1, Number(q.get("adults") || 2)),
    children: Math.max(0, Number(q.get("children") || 0)),
    rooms: Math.max(1, Number(q.get("rooms") || 1)),
    promo: q.get("promo") || ""
  };
}

function currentGuestForm() {
  return {
    firstName: document.getElementById("firstName")?.value.trim() || "",
    lastName: document.getElementById("lastName")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: document.getElementById("phone")?.value.trim() || "",
    country: document.getElementById("country")?.value || "",
    note: document.getElementById("note")?.value.trim() || "",
    promo: document.getElementById("promo")?.value.trim() || ""
  };
}

function currentQuoteInput() {
  const ctx = bookingContext();
  return {
    roomId: ctx.roomId,
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    adults: ctx.adults,
    children: ctx.children,
    promo: document.getElementById("promo")?.value.trim() || ctx.promo
  };
}

function renderBookingItem(room, resort, ctx) {
  const box = document.getElementById("bookingItem");
  if (!box) return;
  box.innerHTML = `
    <h2>Your selection</h2>
    <div class="selection-row">
      <img src="${room.images[0]}" alt="${escapeHtml(room.name)}">
      <div>
        ${resort ? `<p class="sel-resort"><i class="fa-solid fa-hotel" aria-hidden="true"></i> ${escapeHtml(resort.name)} · ${escapeHtml(resort.city)}</p>` : ""}
        <h3>${escapeHtml(room.name)}</h3>
        <p class="roomtype-facts">
          <span><i class="fa-solid fa-user-group" aria-hidden="true"></i> ${room.capacity} guests</span>
          <span><i class="fa-solid fa-bed" aria-hidden="true"></i> ${escapeHtml(room.bedType)}</span>
          <span><i class="fa-solid fa-ruler-combined" aria-hidden="true"></i> ${escapeHtml(room.size)}</span>
        </p>
        <p class="roomtype-tags">
          ${room.breakfastIncluded ? `<span class="tag-ok"><i class="fa-solid fa-check"></i> Breakfast included</span>` : ""}
          ${room.freeCancellation ? `<span class="tag-ok"><i class="fa-solid fa-check"></i> Free cancellation</span>` : `<span class="tag-muted">Non-refundable</span>`}
        </p>
      </div>
    </div>
    <div class="stay-strip">
      <div><span>Check-in</span><strong>${escapeHtml(ctx.checkIn)}</strong><small>From 14:00</small></div>
      <div><span>Check-out</span><strong>${escapeHtml(ctx.checkOut)}</strong><small>Until 12:00</small></div>
      <div><span>Guests</span><strong>${ctx.adults} adult(s), ${ctx.children} child(ren)</strong><small>${ctx.rooms} room(s)</small></div>
    </div>`;
}

function renderBookingSummary() {
  const box = document.getElementById("bookingSummary");
  if (!box) return;
  const q = GuestAPI.quote(currentQuoteInput());
  if (!q.room) {
    box.innerHTML = emptyState("Choose a room", "Select a room to see pricing.", "resorts.html", "Browse resorts");
    return;
  }
  const err = q.errors.map((e) => `<p class="form-error">${escapeHtml(e)}</p>`).join("");
  box.innerHTML = `
    <h3>Price summary</h3>
    <div class="price-lines">
      <div class="price-line"><span>${money(q.room.pricePerNight)} × ${q.nights || 0} night(s)</span><span>${money(q.subtotal)}</span></div>
      ${q.discount ? `<div class="price-line discount"><span>Discount${q.promo ? ` (${escapeHtml(q.promo)})` : ""}</span><span>− ${money(q.discount)}</span></div>` : ""}
      <div class="price-line"><span>Service charge (10%)</span><span>${money(q.serviceCharge)}</span></div>
      <div class="price-line"><span>Tax (10%)</span><span>${money(q.tax)}</span></div>
      <div class="price-line total"><span>Total</span><span>${money(q.total)}</span></div>
    </div>
    ${err}
    <button class="btn btn-primary" type="button" id="continuePayment" ${q.errors.length ? "disabled" : ""}>Continue to Payment</button>
    <p class="hint">You won't be charged yet. Payment is simulated on this demo site.</p>`;
  document.getElementById("continuePayment")?.addEventListener("click", handleContinue);
}

function setFieldError(name, message) {
  const el = document.querySelector(`.field-error[data-for="${name}"]`);
  const input = document.getElementById(name);
  if (el) el.textContent = message || "";
  if (input) input.classList.toggle("invalid", Boolean(message));
  return !message;
}

function validateGuestForm() {
  const g = currentGuestForm();
  let ok = true;
  ok = setFieldError("firstName", g.firstName ? "" : "First name is required.") && ok;
  ok = setFieldError("lastName", g.lastName ? "" : "Last name is required.") && ok;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email);
  ok = setFieldError("email", g.email ? (emailOk ? "" : "Enter a valid email address.") : "Email is required.") && ok;
  const phoneDigits = g.phone.replace(/[^\d]/g, "");
  ok = setFieldError("phone", g.phone ? (phoneDigits.length >= 8 ? "" : "Enter a valid phone number.") : "Phone is required.") && ok;
  ok = setFieldError("country", g.country ? "" : "Please select a country.") && ok;
  return ok;
}

function bookingReturnUrl() {
  const params = new URLSearchParams(location.search);
  const page = `booking.html${params.toString() ? `?${params.toString()}` : ""}`;
  return `login.html?next=${encodeURIComponent(page)}`;
}

function handleContinue() {
  const quote = GuestAPI.quote(currentQuoteInput());
  if (quote.errors.length) {
    toast(quote.errors[0]);
    renderBookingSummary();
    return;
  }
  if (!validateGuestForm()) {
    toast("Please complete the guest details.");
    document.querySelector(".field.invalid")?.focus();
    return;
  }
  const g = currentGuestForm();
  const ctx = bookingContext();
  const draft = {
    roomId: ctx.roomId,
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    adults: ctx.adults,
    children: ctx.children,
    rooms: ctx.rooms,
    promo: g.promo,
    guestName: `${g.firstName} ${g.lastName}`.trim(),
    firstName: g.firstName,
    lastName: g.lastName,
    email: g.email,
    phone: g.phone,
    country: g.country,
    note: g.note
  };
  GuestAPI.draft.save(draft);

  if (!GuestAPI.auth.session()) {
    toast("Login or register to continue to payment.");
    location.href = bookingReturnUrl();
    return;
  }
  location.href = "payment.html";
}

function initBookingPage() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const ctx = bookingContext();
  const room = GuestAPI.catalog.room(ctx.roomId);
  if (!room) {
    document.querySelector(".booking-layout").innerHTML = emptyState(
      "Room not found",
      "Pick a room from a resort to start your booking.",
      "resorts.html",
      "Browse resorts"
    );
    return;
  }
  const resort = GuestAPI.catalog.resortById(room.resortId);
  renderBookingItem(room, resort, ctx);

  // Prefill from session or a saved draft.
  const session = GuestAPI.auth.session();
  const draft = GuestAPI.draft.get();
  if (draft && draft.roomId === ctx.roomId) {
    document.getElementById("firstName").value = draft.firstName || "";
    document.getElementById("lastName").value = draft.lastName || "";
    document.getElementById("email").value = draft.email || "";
    document.getElementById("phone").value = draft.phone || "";
    if (draft.country) document.getElementById("country").value = draft.country;
    document.getElementById("note").value = draft.note || "";
    if (draft.promo) document.getElementById("promo").value = draft.promo;
  } else if (session) {
    const parts = (session.name || "").split(" ");
    document.getElementById("firstName").value = parts[0] || "";
    document.getElementById("lastName").value = parts.slice(1).join(" ") || "";
    document.getElementById("email").value = session.email || "";
    document.getElementById("phone").value = session.phone || "";
  }
  if (ctx.promo && !document.getElementById("promo").value) document.getElementById("promo").value = ctx.promo;

  if (!session) {
    const note = document.createElement("p");
    note.className = "form-error";
    note.innerHTML = `You can fill in details now — you'll be asked to <a href="${bookingReturnUrl()}">login</a> or <a href="register.html?next=${encodeURIComponent("booking.html" + (location.search || ""))}">register</a> before payment.`;
    form.prepend(note);
  }

  renderBookingSummary();
  document.getElementById("promo")?.addEventListener("input", renderBookingSummary);
  ["firstName", "lastName", "email", "phone", "country"].forEach((id) => {
    document.getElementById(id)?.addEventListener("blur", validateGuestForm);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleContinue();
  });
}

/* ===================== CONFIRMATION ===================== */

function paymentLabel(method) {
  const map = {
    card: "Credit / Debit Card",
    "aba-khqr": "ABA KHQR",
    "acleda-khqr": "ACLEDA KHQR",
    wing: "Wing",
    "bank-transfer": "Bank Transfer",
    "pay-at-resort": "Pay at Resort"
  };
  return map[method] || "Pay at Resort";
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
    root.innerHTML = emptyState("No booking found", "Start a reservation from the resorts page.", "resorts.html", "Browse resorts");
    return;
  }
  root.innerHTML = `
    <div class="confirm-card">
      <div class="confirm-hero">
        <div class="confirm-check"><i class="fa-solid fa-check" aria-hidden="true"></i></div>
        <h1>Booking Confirmed</h1>
        <p>A confirmation has been saved to your account on this device.</p>
        <p class="booking-ref">Booking Reference<strong>${escapeHtml(booking.code)}</strong></p>
      </div>

      <div class="confirm-grid">
        <div class="confirm-block">
          <h3>Stay details</h3>
          <ul class="facts">
            ${booking.resortName ? `<li><i class="fa-solid fa-hotel"></i> ${escapeHtml(booking.resortName)}${booking.resortCity ? ` · ${escapeHtml(booking.resortCity)}` : ""}</li>` : ""}
            <li><i class="fa-solid fa-bed"></i> ${escapeHtml(booking.roomName)}</li>
            <li><i class="fa-regular fa-calendar-check"></i> ${escapeHtml(booking.checkIn)} → ${escapeHtml(booking.checkOut)} (${booking.nights} night(s))</li>
            <li><i class="fa-solid fa-user-group"></i> ${booking.adults} adult(s), ${booking.children} child(ren)</li>
            <li><i class="fa-solid fa-circle-info"></i> Status: ${statusBadge(booking.status)}</li>
          </ul>
        </div>
        <div class="confirm-block">
          <h3>Guest &amp; payment</h3>
          <ul class="facts">
            <li><i class="fa-solid fa-user"></i> ${escapeHtml(booking.guestName)}</li>
            <li><i class="fa-solid fa-envelope"></i> ${escapeHtml(booking.email)}</li>
            ${booking.phone ? `<li><i class="fa-solid fa-phone"></i> ${escapeHtml(booking.phone)}</li>` : ""}
            <li><i class="fa-solid fa-credit-card"></i> ${escapeHtml(paymentLabel(booking.paymentMethod))}</li>
            <li><i class="fa-solid fa-receipt"></i> Total paid: <strong>${money(booking.total)}</strong></li>
          </ul>
        </div>
      </div>

      <div class="btn-row confirm-actions">
        <button class="btn btn-primary" type="button" id="printConfirm"><i class="fa-solid fa-print"></i> Print Booking</button>
        <button class="btn btn-outline" type="button" id="downloadConfirm"><i class="fa-solid fa-download"></i> Download Confirmation</button>
        <a class="btn btn-outline" href="account-bookings.html"><i class="fa-solid fa-suitcase"></i> View My Booking</a>
        <a class="btn btn-ghost" href="home.html"><i class="fa-solid fa-house"></i> Back to Home</a>
      </div>
    </div>`;

  document.getElementById("printConfirm")?.addEventListener("click", () => window.print());
  document.getElementById("downloadConfirm")?.addEventListener("click", () => downloadConfirmation(booking));
}

function downloadConfirmation(b) {
  const lines = [
    "SOLARA RESORT — BOOKING CONFIRMATION",
    "====================================",
    `Booking reference: ${b.code}`,
    `Status: ${b.status}`,
    "",
    `Resort: ${b.resortName || "-"}${b.resortCity ? " (" + b.resortCity + ")" : ""}`,
    `Room: ${b.roomName}`,
    `Check-in: ${b.checkIn} (from 14:00)`,
    `Check-out: ${b.checkOut} (until 12:00)`,
    `Nights: ${b.nights}`,
    `Guests: ${b.adults} adult(s), ${b.children} child(ren)`,
    "",
    `Guest: ${b.guestName}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone || "-"}`,
    `Country: ${b.country || "-"}`,
    `Payment method: ${paymentLabel(b.paymentMethod)}`,
    "",
    `Subtotal: ${money(b.subtotal)}`,
    `Discount: ${money(b.discount)}`,
    `Service charge: ${money(b.serviceCharge)}`,
    `Tax: ${money(b.tax)}`,
    `TOTAL: ${money(b.total)}`,
    "",
    "This is a demo confirmation generated in your browser."
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${b.code}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  initBookingPage();
  initConfirmPage();
});
