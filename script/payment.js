/* ------------------------------------------------------------------ *
 * Payment step (frontend simulation only — no real gateway).
 * Reads the booking draft, renders payment methods and a per-method
 * UI, then creates the booking and moves to the confirmation page.
 * ------------------------------------------------------------------ */

const PAYMENT_METHODS = [
  { id: "card", name: "Credit / Debit Card", icon: "fa-credit-card", note: "Visa, Mastercard, JCB" },
  { id: "aba-khqr", name: "ABA KHQR", icon: "fa-qrcode", note: "Scan with ABA Mobile" },
  { id: "acleda-khqr", name: "ACLEDA KHQR", icon: "fa-qrcode", note: "Scan with ACLEDA mobile" },
  { id: "wing", name: "Wing", icon: "fa-mobile-screen-button", note: "Wing account / agent" },
  { id: "bank-transfer", name: "Bank Transfer", icon: "fa-building-columns", note: "Manual transfer" },
  { id: "pay-at-resort", name: "Pay at Resort", icon: "fa-hotel", note: "Pay on arrival" }
];

let paymentState = { method: "card", quote: null, draft: null, qrTimer: null, qrStatus: "pending" };

function fakeQrSvg(seed) {
  // Deterministic pseudo-random QR-like grid, purely decorative.
  const size = 21;
  let rng = 0;
  for (let i = 0; i < seed.length; i += 1) rng = (rng * 31 + seed.charCodeAt(i)) % 100000;
  const cells = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      const on = (rng >> 8) % 100 < 48;
      // Keep three finder-pattern corners solid-ish.
      const corner = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      if (on || corner) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" class="qr-svg" role="img" aria-label="Payment QR placeholder" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#fff"/>
    <g fill="#0d1b2a">${cells.join("")}</g>
  </svg>`;
}

function renderPaymentSummary() {
  const box = document.getElementById("paymentSummary");
  const q = paymentState.quote;
  if (!box || !q || !q.room) return;
  const resort = GuestAPI.catalog.resortById(q.room.resortId);
  box.innerHTML = `
    <h3>Booking summary</h3>
    <img src="${q.room.images[0]}" alt="${escapeHtml(q.room.name)}">
    ${resort ? `<p class="sel-resort"><i class="fa-solid fa-hotel"></i> ${escapeHtml(resort.name)} · ${escapeHtml(resort.city)}</p>` : ""}
    <h4 style="margin:6px 0">${escapeHtml(q.room.name)}</h4>
    <p class="hint">${escapeHtml(q.checkIn)} → ${escapeHtml(q.checkOut)} · ${q.nights} night(s)</p>
    <p class="hint">${q.adults} adult(s), ${q.children} child(ren)</p>
    <div class="price-lines">
      <div class="price-line"><span>${money(q.room.pricePerNight)} × ${q.nights}</span><span>${money(q.subtotal)}</span></div>
      ${q.discount ? `<div class="price-line discount"><span>Discount${q.promo ? ` (${escapeHtml(q.promo)})` : ""}</span><span>− ${money(q.discount)}</span></div>` : ""}
      <div class="price-line"><span>Service charge</span><span>${money(q.serviceCharge)}</span></div>
      <div class="price-line"><span>Tax</span><span>${money(q.tax)}</span></div>
      <div class="price-line total"><span>Total</span><span>${money(q.total)}</span></div>
    </div>`;
}

function renderMethodCards() {
  const root = document.getElementById("paymentMethods");
  if (!root) return;
  root.innerHTML = PAYMENT_METHODS.map(
    (m) => `<button type="button" class="pay-method ${m.id === paymentState.method ? "selected" : ""}" data-method="${m.id}" aria-pressed="${m.id === paymentState.method}">
      <span class="pay-icon"><i class="fa-solid ${m.icon}" aria-hidden="true"></i></span>
      <span class="pay-text"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.note)}</small></span>
      <span class="pay-radio" aria-hidden="true"></span>
    </button>`
  ).join("");
  root.querySelectorAll(".pay-method").forEach((btn) => {
    btn.addEventListener("click", () => {
      paymentState.method = btn.dataset.method;
      stopQrTimer();
      renderMethodCards();
      renderMethodPanel();
    });
  });
}

function statusPill(status) {
  const map = {
    pending: ["Pending", "badge-pending"],
    processing: ["Processing", "badge-checked_in"],
    paid: ["Paid", "badge-confirmed"],
    failed: ["Failed", "badge-cancelled"]
  };
  const [label, cls] = map[status] || map.pending;
  return `<span class="badge ${cls}" id="payStatus">${label}</span>`;
}

function stopQrTimer() {
  if (paymentState.qrTimer) {
    clearInterval(paymentState.qrTimer);
    paymentState.qrTimer = null;
  }
}

function renderMethodPanel() {
  const panel = document.getElementById("paymentPanel");
  const q = paymentState.quote;
  if (!panel || !q) return;
  const method = paymentState.method;
  const total = money(q.total);

  if (method === "card") {
    panel.innerHTML = `
      <h3>Card details</h3>
      <form id="cardForm" class="pay-form" novalidate>
        <label for="cardNumber">Card number</label>
        <input class="field" id="cardNumber" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456">
        <label for="cardName">Name on card</label>
        <input class="field" id="cardName" placeholder="As shown on card">
        <div class="form-row">
          <div><label for="cardExp">Expiry (MM/YY)</label><input class="field" id="cardExp" maxlength="5" placeholder="08/29"></div>
          <div><label for="cardCvv">CVV</label><input class="field" id="cardCvv" inputmode="numeric" maxlength="4" placeholder="123"></div>
        </div>
        <p class="field-error" id="cardError"></p>
        <button class="btn btn-primary btn-block" type="submit">Pay ${total}</button>
      </form>`;
    const num = document.getElementById("cardNumber");
    num.addEventListener("input", () => {
      num.value = num.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    });
    const exp = document.getElementById("cardExp");
    exp.addEventListener("input", () => {
      let v = exp.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
      exp.value = v;
    });
    document.getElementById("cardForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const digits = num.value.replace(/\s/g, "");
      const err = document.getElementById("cardError");
      if (digits.length < 15) return (err.textContent = "Enter a valid card number.");
      if (!document.getElementById("cardName").value.trim()) return (err.textContent = "Enter the name on the card.");
      if (!/^\d{2}\/\d{2}$/.test(exp.value)) return (err.textContent = "Enter a valid expiry date.");
      if (!/^\d{3,4}$/.test(document.getElementById("cardCvv").value)) return (err.textContent = "Enter a valid CVV.");
      err.textContent = "";
      simulateProcessing(() => finalizeBooking(method));
    });
    return;
  }

  if (method === "aba-khqr" || method === "acleda-khqr") {
    const bank = method === "aba-khqr" ? "ABA" : "ACLEDA";
    panel.innerHTML = `
      <h3>${bank} KHQR</h3>
      <div class="khqr-panel">
        <div class="khqr-card">
          <div class="khqr-head"><span>${bank} KHQR</span><span>Solara Resort</span></div>
          ${fakeQrSvg(paymentState.draft.roomId + q.total)}
          <p class="khqr-amount">${total}</p>
          <p class="khqr-hint">Scan with your ${bank} mobile app</p>
        </div>
        <div class="khqr-side">
          <p class="khqr-status-row">Payment status: ${statusPill(paymentState.qrStatus)}</p>
          <p class="khqr-timer">Expires in <strong id="qrCountdown">05:00</strong></p>
          <button class="btn btn-primary btn-block" type="button" id="simulatePay">Simulate scan &amp; pay</button>
          <button class="btn btn-outline btn-block" type="button" id="qrRefresh">Refresh QR</button>
          <p class="hint">Placeholder QR only. No funds are moved.</p>
        </div>
      </div>`;
    startQrTimer();
    document.getElementById("simulatePay").addEventListener("click", () => {
      setQrStatus("processing");
      setTimeout(() => {
        setQrStatus("paid");
        stopQrTimer();
        setTimeout(() => finalizeBooking(method), 700);
      }, 1400);
    });
    document.getElementById("qrRefresh").addEventListener("click", () => {
      setQrStatus("pending");
      startQrTimer();
    });
    return;
  }

  if (method === "wing") {
    panel.innerHTML = `
      <h3>Wing</h3>
      <form id="wingForm" class="pay-form" novalidate>
        <label for="wingPhone">Wing account number</label>
        <input class="field" id="wingPhone" inputmode="tel" placeholder="0XX XXX XXX">
        <p class="field-error" id="wingError"></p>
        <p class="hint">A payment request of <strong>${total}</strong> will be sent to your Wing account.</p>
        <button class="btn btn-primary btn-block" type="submit">Send payment request</button>
      </form>`;
    document.getElementById("wingForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const val = document.getElementById("wingPhone").value.replace(/\D/g, "");
      if (val.length < 8) return (document.getElementById("wingError").textContent = "Enter a valid Wing number.");
      document.getElementById("wingError").textContent = "";
      simulateProcessing(() => finalizeBooking(method));
    });
    return;
  }

  if (method === "bank-transfer") {
    panel.innerHTML = `
      <h3>Bank Transfer</h3>
      <div class="bank-details">
        <div><span>Bank</span><strong>ABA Bank</strong></div>
        <div><span>Account name</span><strong>Solara Resort Co., Ltd</strong></div>
        <div><span>Account number</span><strong>000 123 456</strong></div>
        <div><span>Amount</span><strong>${total}</strong></div>
        <div><span>Reference</span><strong>Your booking email</strong></div>
      </div>
      <p class="hint">Transfer the amount, then confirm below. Your booking will be held as pending.</p>
      <button class="btn btn-primary btn-block" type="button" id="bankDone">I've made the transfer</button>`;
    document.getElementById("bankDone").addEventListener("click", () => finalizeBooking(method));
    return;
  }

  // pay-at-resort
  panel.innerHTML = `
    <h3>Pay at Resort</h3>
    <p>Reserve now and pay <strong>${total}</strong> at check-in. A valid ID and the booking reference will be required at the front desk.</p>
    <ul class="cta-points">
      <li><i class="fa-solid fa-check"></i> No payment needed today</li>
      <li><i class="fa-solid fa-check"></i> Free cancellation may apply per room policy</li>
    </ul>
    <button class="btn btn-primary btn-block" type="button" id="reserveNow">Reserve now</button>`;
  document.getElementById("reserveNow").addEventListener("click", () => finalizeBooking(method));
}

function setQrStatus(status) {
  paymentState.qrStatus = status;
  const el = document.getElementById("payStatus");
  if (el) el.outerHTML = statusPill(status);
}

function startQrTimer() {
  stopQrTimer();
  let remaining = 300;
  const tick = () => {
    const el = document.getElementById("qrCountdown");
    if (!el) return stopQrTimer();
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    el.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      stopQrTimer();
      setQrStatus("failed");
      const el2 = document.getElementById("qrCountdown");
      if (el2) el2.textContent = "00:00";
      return;
    }
    remaining -= 1;
  };
  tick();
  paymentState.qrTimer = setInterval(tick, 1000);
}

function simulateProcessing(done) {
  toast("Processing payment…");
  setTimeout(done, 1200);
}

function finalizeBooking(method) {
  const draft = paymentState.draft;
  if (!draft) return;
  const result = GuestAPI.bookings.create({ ...draft, paymentMethod: method });
  if (!result.ok) {
    toast((result.errors && result.errors[0]) || result.error || "Could not complete booking.");
    return;
  }
  GuestAPI.draft.clear();
  location.href = "booking-confirm.html";
}

function initPaymentPage() {
  const layout = document.getElementById("paymentLayout");
  if (!layout) return;

  const draft = GuestAPI.draft.get();
  if (!draft || !draft.roomId) {
    layout.innerHTML = emptyState("No booking in progress", "Start by choosing a resort and room.", "resorts.html", "Browse resorts");
    return;
  }
  if (!GuestAPI.auth.session()) {
    location.href = `login.html?next=${encodeURIComponent("payment.html")}`;
    return;
  }
  const quote = GuestAPI.quote({
    roomId: draft.roomId,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    adults: draft.adults,
    children: draft.children,
    promo: draft.promo
  });
  if (!quote.room || quote.errors.length) {
    layout.innerHTML = emptyState("Booking needs attention", quote.errors[0] || "Please review your dates and room.", "booking.html?" + new URLSearchParams({ room: draft.roomId, checkIn: draft.checkIn, checkOut: draft.checkOut, adults: draft.adults, children: draft.children }).toString(), "Back to details");
    return;
  }

  paymentState.draft = draft;
  paymentState.quote = quote;
  renderPaymentSummary();
  renderMethodCards();
  renderMethodPanel();
}

document.addEventListener("DOMContentLoaded", initPaymentPage);
