/* ------------------------------------------------------------------ *
 * Payment step — KHQR follows Payment_process/bakong-ecom (poll + status).
 * Booking totals and KHQR amounts come from Web_Resort_api only.
 * ------------------------------------------------------------------ */

const PAYMENT_METHODS = [
  { id: "card", name: "Credit / Debit Card", icon: "fa-credit-card", note: "Visa, Mastercard, JCB" },
  { id: "aba-khqr", name: "ABA KHQR", icon: "fa-qrcode", note: "Scan with ABA Mobile" },
  { id: "acleda-khqr", name: "ACLEDA KHQR", icon: "fa-qrcode", note: "Scan with ACLEDA mobile" },
  { id: "wing", name: "Wing", icon: "fa-mobile-screen-button", note: "Wing account / agent" },
  { id: "bank-transfer", name: "Bank Transfer", icon: "fa-building-columns", note: "Manual transfer" },
  { id: "pay-at-resort", name: "Pay at Resort", icon: "fa-hotel", note: "Pay on arrival" }
];

let paymentState = {
  method: "card",
  quote: null,
  draft: null,
  booking: null,
  khqrPayment: null,
  khqrPoll: null,
  qrTimer: null,
  qrStatus: "pending",
  khqrStopped: false,
  khqrVerifyInFlight: false,
  khqrSuccessShown: false
};

let paymentPageUnloadBound = false;

function bindPaymentPageUnload() {
  if (paymentPageUnloadBound) return;
  paymentPageUnloadBound = true;
  const stopAll = () => {
    paymentState.khqrStopped = true;
    stopKhqrPoll();
    stopQrTimer();
  };
  window.addEventListener("pagehide", stopAll);
  window.addEventListener("beforeunload", stopAll);
}

/**
 * Modal dialog for payment outcomes (success / error / info).
 */
function showPaymentDialog({ type = "info", title, message, okLabel = "OK", onOk }) {
  if (type === "success" && paymentState.khqrSuccessShown) return;
  if (type === "success") paymentState.khqrSuccessShown = true;
  document.getElementById("paymentDialog")?.remove();
  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    info: "fa-circle-info",
    warning: "fa-triangle-exclamation"
  };
  const overlay = document.createElement("div");
  overlay.id = "paymentDialog";
  overlay.className = "payment-dialog-overlay";
  overlay.innerHTML = `
    <div class="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="paymentDialogTitle">
      <div class="payment-dialog-icon ${escapeHtml(type)}"><i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i></div>
      <h3 id="paymentDialogTitle">${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      <button type="button" class="btn btn-primary" id="paymentDialogOk">${escapeHtml(okLabel)}</button>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => {
    overlay.remove();
    if (typeof onOk === "function") onOk();
  };
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.getElementById("paymentDialogOk").addEventListener("click", close);
}

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
      ${q.roomDiscount ? `<div class="price-line discount"><span>Room discount (${q.discountPercent}%)</span><span>− ${money(q.roomDiscount)}</span></div>` : ""}
      ${q.couponDiscount ? `<div class="price-line discount"><span>Promo${q.promo ? ` (${escapeHtml(q.promo)})` : ""}</span><span>− ${money(q.couponDiscount)}</span></div>` : ""}
      ${q.discount ? `<div class="price-line"><span>Discounted subtotal</span><span>${money(q.afterDiscount)}</span></div>` : ""}
      <div class="price-line"><span>Service charge</span><span>${money(q.serviceCharge)}</span></div>
      <div class="price-line"><span>Tax</span><span>${money(q.tax)}</span></div>
      <div class="price-line total"><span>Total</span><span>${money(q.total)}</span></div>
    </div>
    <p class="hint">${q.authoritative ? "Total confirmed by the resort system." : "Showing an estimate — the resort system confirms the final total."}</p>`;
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
      stopKhqrPoll();
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

function stopKhqrPoll() {
  if (paymentState.khqrPoll) {
    clearInterval(paymentState.khqrPoll);
    paymentState.khqrPoll = null;
  }
}

/** Prefer server SVG from Web_Resort_api (Payment_process/bakong-ecom QrCode::generate). */
function renderKhqrInto(container, payment) {
  if (!container || !payment) return;
  const svg = payment.qr_svg;
  const payload = payment.qr_payload;
  if (svg && typeof svg === "string" && svg.includes("<svg")) {
    container.innerHTML = `<div class="khqr-img khqr-svg-wrap" aria-label="Scan to pay with KHQR">${svg}</div>`;
    const el = container.querySelector("svg");
    if (el) {
      el.setAttribute("width", "220");
      el.setAttribute("height", "220");
    }
    return;
  }
  if (!payload) return;
  container.innerHTML = '<canvas class="khqr-img" width="220" height="220" aria-label="Scan to pay with KHQR"></canvas>';
  const canvas = container.querySelector("canvas");
  if (typeof QRCode === "undefined") {
    container.innerHTML = `<p class="hint">QR library failed to load. Refresh the page or check your connection.</p>`;
    return;
  }
  QRCode.toCanvas(
    canvas,
    String(payload),
    { width: 220, margin: 2, errorCorrectionLevel: "M" },
    (err) => {
      if (err) {
        container.innerHTML = `<p class="hint">Could not render QR. Try generating a new code.</p>`;
      }
    }
  );
}

async function ensureBookingCreated() {
  if (paymentState.booking) return paymentState.booking;
  const draft = paymentState.draft;
  if (!draft) return null;
  const result = await GuestAPI.bookings.create({ ...draft, paymentMethod: paymentState.method });
  if (!result.ok) {
    const msg = (result.errors && result.errors[0]) || result.error || "Could not create booking.";
    showPaymentDialog({ type: "error", title: "Booking failed", message: msg });
    return null;
  }
  paymentState.booking = result.booking;
  return paymentState.booking;
}

async function loadKhqrPayment(gateway) {
  const booking = await ensureBookingCreated();
  if (!booking?.id) return null;
  const res = await GuestAPI.payments.createKhqr(booking.id, gateway);
  if (!res.ok) {
    showPaymentDialog({
      type: "error",
      title: "KHQR unavailable",
      message: res.error || "Could not generate the payment QR. Check Bakong settings on the API server."
    });
    return null;
  }
  paymentState.khqrPayment = res.payment;
  paymentState.qrStatus = "pending";
  paymentState.khqrStopped = false;
  paymentState.khqrSuccessShown = false;
  return res.payment;
}

function stopKhqrPollingTerminal() {
  paymentState.khqrStopped = true;
  stopKhqrPoll();
  stopQrTimer();
}

function showKhqrSuccessDialog(message) {
  if (paymentState.khqrSuccessShown) return;
  stopKhqrPollingTerminal();
  setQrStatus("paid");
  const statusEl = document.getElementById("payment-status");
  if (statusEl) statusEl.textContent = message || "Payment confirmed.";
  showPaymentDialog({
    type: "success",
    title: "Payment confirmed",
    message: message || "Your KHQR payment was verified. You will receive a booking confirmation next.",
    okLabel: "Continue",
    onOk: () => {
      GuestAPI.draft.clear();
      sessionStorage.setItem("solara_last_booking", JSON.stringify(paymentState.booking));
      location.href = "booking-confirm.html";
    }
  });
}

/** Poll Bakong via API — mirrors Payment_process/bakong-ecom checkout.blade.php */
function startKhqrPoll(payment) {
  stopKhqrPoll();
  paymentState.khqrStopped = false;
  paymentState.khqrVerifyInFlight = false;
  const md5 = payment?.khqr_md5;
  const statusEl = () => document.getElementById("payment-status");

  async function check() {
    if (paymentState.khqrStopped || paymentState.khqrVerifyInFlight) return;
    paymentState.khqrVerifyInFlight = true;
    try {
      const res = await GuestAPI.payments.verifyKhqr(md5 || payment.id);
      if (paymentState.khqrStopped) return;
      if (!res.ok) {
        if (res.status === "expired" || res.status === "failed" || res.status === "invalid") {
          stopKhqrPollingTerminal();
          setQrStatus("failed");
          if (statusEl()) statusEl().textContent = res.error || res.message;
          showPaymentDialog({
            type: "error",
            title: "Payment not completed",
            message: res.error || res.message || "This QR could not be settled. Generate a new QR or choose another method."
          });
          return;
        }
        if (statusEl()) statusEl().textContent = res.error || "Network problem while checking payment.";
        return;
      }
      if (res.paid) {
        showKhqrSuccessDialog(res.message);
        return;
      }
      if (res.status === "expired" || res.status === "failed" || res.status === "invalid") {
        stopKhqrPollingTerminal();
        setQrStatus("failed");
        if (statusEl()) statusEl().textContent = res.message;
        showPaymentDialog({
          type: "error",
          title: "Payment not completed",
          message: res.message || "This QR could not be settled. Generate a new QR or choose another method."
        });
        return;
      }
      if (statusEl()) {
        const qrExpiredUi = statusEl().dataset.expiredNotice === "1";
        if (res.status === "api_error") {
          statusEl().textContent = res.message;
        } else if (qrExpiredUi) {
          statusEl().textContent = res.message || "QR timer ended — still checking for your payment…";
        } else {
          statusEl().textContent = "Waiting for payment…";
        }
      }
    } finally {
      paymentState.khqrVerifyInFlight = false;
    }
  }

  paymentState.khqrPoll = setInterval(check, 3000);
  check();
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
          <div id="khqrImage" class="khqr-loading"><p>Preparing secure QR…</p></div>
          <p class="khqr-amount">${total}</p>
          <p class="khqr-hint">Scan with your ${bank} mobile app. Amount is set by the resort system.</p>
        </div>
        <div class="khqr-side">
          <p class="khqr-status-row">Payment status: ${statusPill(paymentState.qrStatus)}</p>
          <p id="payment-status">Waiting for payment…</p>
          <p class="khqr-timer">Expires in <strong id="qrCountdown">05:00</strong></p>
          <button class="btn btn-outline btn-block" type="button" id="qrRefresh">Generate new QR</button>
          <p class="hint">Scan with Bakong — the resort system verifies payment automatically.</p>
        </div>
      </div>`;
    (async () => {
      const pay = await loadKhqrPayment(method);
      const box = document.getElementById("khqrImage");
      if (!box) return;
      if (!pay?.qr_payload) {
        box.innerHTML = `<p class="hint">Could not load QR. Check Bakong configuration or try again.</p>`;
        return;
      }
      renderKhqrInto(box, pay);
      startQrTimer(pay.seconds_remaining || 300);
      startKhqrPoll(pay);
    })();
    document.getElementById("qrRefresh").addEventListener("click", async () => {
      stopKhqrPoll();
      paymentState.khqrStopped = false;
      setQrStatus("pending");
      const st = document.getElementById("payment-status");
      if (st) st.textContent = "Generating a new QR…";
      const pay = await loadKhqrPayment(method);
      const box = document.getElementById("khqrImage");
      if (box && pay?.qr_payload) {
        renderKhqrInto(box, pay);
        startQrTimer(pay.seconds_remaining || 300);
        startKhqrPoll(pay);
      }
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

function startQrTimer(initialSeconds = 300) {
  stopQrTimer();
  let remaining = Math.max(0, Number(initialSeconds) || 300);
  const tick = async () => {
    const el = document.getElementById("qrCountdown");
    if (!el) return stopQrTimer();
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    el.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      if (el) el.textContent = "00:00";
      stopQrTimer();
      if (paymentState.khqrPayment && !paymentState.khqrStopped) {
        const st = document.getElementById("payment-status");
        if (st && !st.dataset.expiredNotice) {
          st.dataset.expiredNotice = "1";
          st.textContent = "QR timer ended — still checking for your payment…";
        }
      }
      return;
    }
    remaining -= 1;
  };
  tick();
  paymentState.qrTimer = setInterval(tick, 1000);
}

function simulateProcessing(done) {
  toast("Processing…");
  setTimeout(done, 1200);
}

async function finalizeBooking(method) {
  const booking = await ensureBookingCreated();
  if (!booking) return;
  const payAtResort = method === "pay-at-resort" || method === "bank-transfer";
  showPaymentDialog({
    type: "success",
    title: payAtResort ? "Reservation confirmed" : "Booking confirmed",
    message: payAtResort
      ? `Reference ${booking.code}. Pay at the resort according to your booking total.`
      : `Reference ${booking.code}. Your booking is saved in the resort system.`,
    okLabel: "View confirmation",
    onOk: () => {
      GuestAPI.draft.clear();
      sessionStorage.setItem("solara_last_booking", JSON.stringify(booking));
      location.href = "booking-confirm.html";
    }
  });
}

async function initPaymentPage() {
  const layout = document.getElementById("paymentLayout");
  if (!layout) return;
  bindPaymentPageUnload();

  const draft = GuestAPI.draft.get();
  if (!draft || !draft.roomId) {
    layout.innerHTML = emptyState("No booking in progress", "Start by choosing a resort and room.", "resorts.html", "Browse resorts");
    return;
  }
  if (!GuestAPI.auth.session()) {
    location.href = `login.html?next=${encodeURIComponent("payment.html")}`;
    return;
  }
  const quote = await GuestAPI.quoteAuthoritative({
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

document.addEventListener("DOMContentLoaded", () => {
  GuestAPI.ready().finally(initPaymentPage);
});
