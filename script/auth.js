function guestNextPage() {
  const next = new URLSearchParams(location.search).get("next") || "";
  if (/^[a-z0-9\-]+\.html(\?[-a-z0-9_.=&%]*)?$/i.test(next)) return next;
  return "account.html";
}

function accountNav(active) {
  const items = [
    ["account.html", "Dashboard"],
    ["account-bookings.html", "My bookings"],
    ["account-notifications.html", "Notifications"],
    ["account-settings.html", "Settings"]
  ];
  return `<nav class="account-nav">${items
    .map(([href, label]) => `<a class="${active === href ? "active" : ""}" href="${href}">${label}</a>`)
    .join("")}</nav>`;
}

function profileCompletion(user) {
  const fields = [user.name, user.email, user.phone, user.profile?.city];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function initAuthPages() {
  const next = new URLSearchParams(location.search).get("next");
  if (next) {
    document.querySelectorAll('a[href="register.html"], a[href="login.html"]').forEach((a) => {
      a.setAttribute("href", `${a.getAttribute("href")}?next=${encodeURIComponent(next)}`);
    });
  }
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm).entries());
      const err = document.getElementById("authError");
      if (data.password !== data.confirm) {
        if (err) err.textContent = "Passwords do not match.";
        toast("Passwords do not match");
        return;
      }
      const result = GuestAPI.auth.register(data);
      if (!result.ok) {
        if (err) err.textContent = result.error;
        toast(result.error);
        return;
      }
      toast("Account created on this device");
      location.href = guestNextPage();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      const result = GuestAPI.auth.login(data);
      const err = document.getElementById("authError");
      if (!result.ok) {
        if (err) err.textContent = result.error;
        toast(result.error);
        return;
      }
      toast("Welcome back");
      location.href = guestNextPage();
    });
  }
}

function initAccountDashboard() {
  const root = document.getElementById("accountRoot");
  if (!root) return;
  const session = GuestAPI.auth.requireSession();
  if (!session) return;
  const user = GuestAPI.auth.currentUser();
  const bookings = GuestAPI.bookings.mine();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.find((b) => b.checkIn >= today && !["cancelled", "checked_out", "completed"].includes(b.status));
  const recent = bookings[0];
  root.innerHTML = `
    <section class="section">
      <div class="container">
        ${accountNav("account.html")}
        <h2>Hello, ${escapeHtml(session.name)}</h2>
        <p class="lead">Your guest profile on this browser. Book a room and it will appear in My bookings.</p>
        <p style="text-align:center;margin-bottom:24px">
          <a class="btn btn-primary" href="booking.html">Book a room</a>
          <a class="btn btn-ghost" href="room.html">Browse rooms</a>
        </p>
        <div class="stat-grid">
          <article class="card pad"><h3>${bookings.length}</h3><p>Bookings</p></article>
          <article class="card pad"><h3>${GuestAPI.notifications.unreadCount()}</h3><p>Unread notifications</p></article>
          <article class="card pad"><h3>${profileCompletion(user)}%</h3><p>Profile complete</p></article>
        </div>
        <div class="grid-2 account-split">
          <article class="card pad">
            <h3>Upcoming</h3>
            ${
              upcoming
                ? `<p>${escapeHtml(upcoming.roomName)}</p><p>${escapeHtml(upcoming.checkIn)} → ${escapeHtml(upcoming.checkOut)}</p>
                   <a href="account-booking.html?id=${encodeURIComponent(upcoming.id)}">View details</a>`
                : `<p>No upcoming stay. <a href="room.html">Browse rooms</a>.</p>`
            }
          </article>
          <article class="card pad">
            <h3>Recent</h3>
            ${
              recent
                ? `<p>${escapeHtml(recent.code)} · ${statusBadge(recent.status)}</p>
                   <a href="account-booking.html?id=${encodeURIComponent(recent.id)}">View details</a>`
                : `<p>No bookings yet.</p>`
            }
          </article>
        </div>
      </div>
    </section>`;
}

function bookingRow(b) {
  return `<article class="card pad booking-card">
    <div>
      <p class="code-line">${escapeHtml(b.code)} ${statusBadge(b.status)}</p>
      <h3>${escapeHtml(b.roomName)}</h3>
      <p>${escapeHtml(b.checkIn)} → ${escapeHtml(b.checkOut)} · ${b.nights} nights · ${b.adults + b.children} guests</p>
      <p>Total ${money(b.total)} · Created ${escapeHtml(b.created_at.slice(0, 10))}</p>
    </div>
    <div class="btn-row">
      <a class="btn btn-outline" href="account-booking.html?id=${encodeURIComponent(b.id)}">View details</a>
    </div>
  </article>`;
}

function initAccountBookings() {
  const root = document.getElementById("bookingsRoot");
  if (!root) return;
  if (!GuestAPI.auth.requireSession()) return;
  const list = GuestAPI.bookings.mine();
  const today = new Date().toISOString().slice(0, 10);
  const render = () => {
    const status = document.getElementById("bookingStatus")?.value || "";
    const filtered = list.filter((b) => !status || b.status === status);
    const upcoming = filtered.filter((b) => b.checkOut >= today && b.status !== "cancelled");
    const past = filtered.filter((b) => b.checkOut < today || b.status === "cancelled");
    root.querySelector("#bookingLists").innerHTML = filtered.length
      ? `<h3>Upcoming</h3>${upcoming.map(bookingRow).join("") || "<p>None.</p>"}
         <h3>Past</h3>${past.map(bookingRow).join("") || "<p>None.</p>"}`
      : emptyState("No bookings", "Reservations you confirm on this device will appear here.", "room.html", "Find a room");
  };
  root.innerHTML = `
    <section class="section"><div class="container">
      ${accountNav("account-bookings.html")}
      <h2>My bookings</h2>
      <select class="field" id="bookingStatus" style="max-width:240px;margin-bottom:20px">
        <option value="">All statuses</option>
        ${["pending", "confirmed", "checked_in", "checked_out", "cancelled", "completed"].map((s) => `<option value="${s}">${s.replace("_", " ")}</option>`).join("")}
      </select>
      <div id="bookingLists"></div>
    </div></section>`;
  document.getElementById("bookingStatus")?.addEventListener("change", render);
  render();
}

function initAccountBookingDetail() {
  const root = document.getElementById("bookingDetailRoot");
  if (!root) return;
  if (!GuestAPI.auth.requireSession()) return;
  const id = new URLSearchParams(location.search).get("id");
  const booking = GuestAPI.bookings.get(id);
  if (!booking) {
    root.innerHTML = `<section class="section"><div class="container">${accountNav("account-bookings.html")}${emptyState("Booking not found", "This reservation is not linked to your guest session.", "account-bookings.html", "Back to bookings")}</div></section>`;
    return;
  }
  root.innerHTML = `
    <section class="section"><div class="container">
      ${accountNav("account-bookings.html")}
      <article class="card pad">
        <h2>${escapeHtml(booking.code)}</h2>
        <p>${statusBadge(booking.status)}</p>
        <ul class="facts">
          <li>Room: ${escapeHtml(booking.roomName)}</li>
          <li>Stay: ${escapeHtml(booking.checkIn)} → ${escapeHtml(booking.checkOut)}</li>
          <li>Nights: ${booking.nights}</li>
          <li>Guests: ${booking.adults} adults, ${booking.children} children</li>
          <li>Subtotal: ${money(booking.subtotal)}</li>
          <li>Discount: ${money(booking.discount)}</li>
          <li>Tax: ${money(booking.tax)}</li>
          <li>Service: ${money(booking.serviceCharge)}</li>
          <li>Total: ${money(booking.total)}</li>
        </ul>
        ${["pending", "confirmed"].includes(booking.status) ? `<button class="btn btn-outline" id="cancelBooking" type="button">Cancel booking</button>` : ""}
      </article>
    </div></section>`;
  document.getElementById("cancelBooking")?.addEventListener("click", () => {
    const result = GuestAPI.bookings.cancel(booking.id);
    toast(result.ok ? "Booking cancelled" : result.error);
    if (result.ok) location.reload();
  });
}

function initNotificationsPage() {
  const root = document.getElementById("notificationsRoot");
  if (!root) return;
  if (!GuestAPI.auth.requireSession()) return;
  const draw = () => {
    const items = GuestAPI.notifications.mine();
    root.innerHTML = `
      <section class="section"><div class="container">
        ${accountNav("account-notifications.html")}
        <div class="page-head">
          <h2>Notifications</h2>
          ${items.length ? `<button class="btn btn-outline" type="button" id="markAll">Mark all as read</button>` : ""}
        </div>
        ${
          items.length
            ? items
                .map(
                  (n) => `<article class="card pad notif ${n.read ? "read" : ""}" data-id="${escapeHtml(n.id)}" data-booking="${escapeHtml(n.bookingId || "")}">
                    <h3>${escapeHtml(n.title)}</h3>
                    <p>${escapeHtml(n.message)}</p>
                    <p class="hint">${escapeHtml(n.created_at.replace("T", " ").slice(0, 16))} · ${n.read ? "Read" : "Unread"}</p>
                  </article>`
                )
                .join("")
            : emptyState("No notifications", "Booking events for this guest account will show here.", "account.html", "Account")
        }
      </div></section>`;
    document.getElementById("markAll")?.addEventListener("click", () => {
      GuestAPI.notifications.markAllRead();
      draw();
      mountShell();
    });
    root.querySelectorAll(".notif").forEach((el) => {
      el.addEventListener("click", () => {
        GuestAPI.notifications.markRead(el.dataset.id);
        if (el.dataset.booking) location.href = `account-booking.html?id=${encodeURIComponent(el.dataset.booking)}`;
        else draw();
      });
    });
  };
  draw();
}

function initSettingsPage() {
  const root = document.getElementById("settingsRoot");
  if (!root) return;
  if (!GuestAPI.auth.requireSession()) return;
  const user = GuestAPI.auth.currentUser();
  root.innerHTML = `
    <section class="section"><div class="container">
      ${accountNav("account-settings.html")}
      <form class="auth-card" id="settingsForm" style="width:min(640px,100%)">
        <h1>Account settings</h1>
        <p>Stored with your guest profile on this browser. Staff RMS settings are separate.</p>
        <p class="form-error" id="settingsError"></p>
        <label>Name</label>
        <input class="field" name="name" value="${escapeHtml(user.name)}" required>
        <label>Email</label>
        <input class="field" type="email" name="email" value="${escapeHtml(user.email)}" required>
        <label>Phone</label>
        <input class="field" name="phone" value="${escapeHtml(user.phone || "")}">
        <label>City</label>
        <input class="field" name="city" value="${escapeHtml(user.profile?.city || "")}">
        <label class="check-line"><input type="checkbox" name="emailUpdates" ${user.settings?.emailUpdates ? "checked" : ""}> Email updates</label>
        <label class="check-line"><input type="checkbox" name="bookingAlerts" ${user.settings?.bookingAlerts ? "checked" : ""}> Booking alerts</label>
        <button class="btn btn-primary" type="submit">Save settings</button>
      </form>
    </div></section>`;
  document.getElementById("settingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const result = GuestAPI.auth.updateProfile({
      name: data.name,
      email: data.email,
      phone: data.phone,
      profile: { city: data.city },
      settings: {
        emailUpdates: Boolean(data.emailUpdates),
        bookingAlerts: Boolean(data.bookingAlerts)
      }
    });
    const err = document.getElementById("settingsError");
    if (!result.ok) {
      if (err) err.textContent = result.error;
      toast(result.error);
      return;
    }
    toast("Settings saved on this device");
    mountShell();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthPages();
  initAccountDashboard();
  initAccountBookings();
  initAccountBookingDetail();
  initNotificationsPage();
  initSettingsPage();
});
