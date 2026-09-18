function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = Math.round((b - a) / 86400000);
  return diff > 0 ? diff : 0;
}

function money(n) {
  return `USD ${Number(n).toFixed(2)}`;
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
  const chunk = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SLR-${chunk}`;
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

const GuestAPI = {
  catalog: {
    rooms() {
      return SolaraData.rooms.map((room) => ({
        ...room,
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

    let promo = null;
    let discount = 0;
    const promoCode = String(input.promo || "").toUpperCase().trim();
    const subtotal = room && nights ? roundMoney(room.pricePerNight * nights) : 0;
    if (promoCode) {
      promo = this.catalog.promo(promoCode);
      if (!promo) errors.push("Invalid promo code.");
      else if (new Date(promo.expiration) < new Date(new Date().toISOString().slice(0, 10))) errors.push("This promo has expired.");
      else if (nights && nights < promo.minimumNights) errors.push(`${promo.code} requires at least ${promo.minimumNights} night(s).`);
      else if (promo.minChildren && children < promo.minChildren) errors.push("FAMILY requires at least one child.");
      else discount = roundMoney(subtotal * (promo.discountValue / 100));
    }
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
      promo: promo && discount ? promo.code : "",
      subtotal,
      discount,
      afterDiscount,
      serviceCharge,
      tax,
      total,
      errors
    };
  },

  auth: {
    register({ name, email, phone, password }) {
      if (Store.findUser(email)) {
        return { ok: false, error: "This email is already registered on this browser." };
      }
      const user = {
        id: newId(),
        name: String(name).trim(),
        email: String(email).trim(),
        phone: String(phone || "").trim(),
        password: String(password),
        created_at: new Date().toISOString(),
        settings: {
          emailUpdates: true,
          bookingAlerts: true,
          language: "en"
        },
        profile: {
          city: "",
          notes: ""
        }
      };
      Store.saveUser(user);
      Store.setSession(user);
      return { ok: true, user };
    },

    login({ email, password }) {
      const user = Store.findUser(email);
      if (!user || user.password !== password) {
        return { ok: false, error: "Email or password is incorrect." };
      }
      Store.setSession(user);
      return { ok: true, user };
    },

    logout() {
      Store.logout();
    },

    session() {
      return Store.session();
    },

    currentUser() {
      const session = Store.session();
      return session ? Store.findUserById(session.id) || session : null;
    },

    requireSession() {
      const session = Store.session();
      if (!session) {
        location.href = "login.html";
        return null;
      }
      return session;
    },

    updateProfile(patch) {
      const session = Store.session();
      if (!session) return { ok: false, error: "Sign in required." };
      const current = Store.findUserById(session.id);
      if (!current) return { ok: false, error: "Account not found on this device." };
      if (patch.email && patch.email !== current.email && Store.findUser(patch.email)) {
        return { ok: false, error: "That email is already used on this browser." };
      }
      const updated = Store.updateUser(session.id, {
        name: patch.name ?? current.name,
        email: patch.email ?? current.email,
        phone: patch.phone ?? current.phone,
        profile: { ...current.profile, ...(patch.profile || {}) },
        settings: { ...current.settings, ...(patch.settings || {}) }
      });
      Store.setSession(updated);
      return { ok: true, user: updated };
    }
  },

  bookings: {
    create(form) {
      const session = Store.session();
      if (!session) return { ok: false, errors: ["Login or register with a guest account to book."] };
      const quote = GuestAPI.quote(form);
      if (quote.errors.length) return { ok: false, errors: quote.errors };
      const booking = {
        id: newId(),
        code: bookingCode(),
        userId: session.id,
        guestName: String(form.guestName || "").trim(),
        email: String(form.email || "").trim(),
        phone: String(form.phone || "").trim(),
        note: String(form.note || "").trim(),
        roomId: quote.room.id,
        roomName: quote.room.name,
        roomCode: quote.room.code,
        checkIn: quote.checkIn,
        checkOut: quote.checkOut,
        nights: quote.nights,
        adults: quote.adults,
        children: quote.children,
        guests: quote.guests,
        subtotal: quote.subtotal,
        discount: quote.discount,
        serviceCharge: quote.serviceCharge,
        tax: quote.tax,
        total: quote.total,
        promo: quote.promo,
        status: "pending",
        created_at: new Date().toISOString()
      };
      Store.addBooking(booking);
      if (session) {
        GuestAPI.notifications.create({
          userId: session.id,
          type: "booking",
          title: "Booking Created",
          message: `Your booking ${booking.code} has been created successfully.`,
          bookingId: booking.id
        });
      }
      sessionStorage.setItem("solara_last_booking", JSON.stringify(booking));
      return { ok: true, booking };
    },

    mine() {
      return Store.myBookings();
    },

    get(id) {
      const booking = Store.getBooking(id);
      if (!booking) return null;
      const session = Store.session();
      if (session && booking.userId && booking.userId !== session.id && booking.email !== session.email) {
        return null;
      }
      return booking;
    },

    cancel(id) {
      const booking = this.get(id);
      if (!booking) return { ok: false, error: "Booking not found." };
      if (!["pending", "confirmed"].includes(booking.status)) {
        return { ok: false, error: "This booking can no longer be cancelled from the guest site." };
      }
      const updated = Store.updateBooking(booking.id, { status: "cancelled" });
      const session = Store.session();
      if (session) {
        GuestAPI.notifications.create({
          userId: session.id,
          type: "booking",
          title: "Booking Cancelled",
          message: `Your booking ${booking.code} was cancelled on this device.`,
          bookingId: booking.id
        });
      }
      return { ok: true, booking: updated };
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
