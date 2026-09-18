const Store = {
  keys: {
    users: "solara_users",
    session: "solara_session",
    bookings: "solara_bookings",
    messages: "solara_messages",
    notifications: "solara_notifications"
  },

  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  users() {
    return this.read(this.keys.users, []);
  },

  saveUser(user) {
    const users = this.users();
    users.push(user);
    this.write(this.keys.users, users);
    return user;
  },

  updateUser(id, patch) {
    const users = this.users().map((u) => (u.id === id ? { ...u, ...patch } : u));
    this.write(this.keys.users, users);
    return users.find((u) => u.id === id) || null;
  },

  findUser(email) {
    return this.users().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  },

  findUserById(id) {
    return this.users().find((u) => u.id === id) || null;
  },

  session() {
    return this.read(this.keys.session, null);
  },

  setSession(user) {
    this.write(this.keys.session, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || ""
    });
  },

  logout() {
    localStorage.removeItem(this.keys.session);
  },

  bookings() {
    return this.read(this.keys.bookings, []);
  },

  addBooking(booking) {
    const list = this.bookings();
    list.unshift(booking);
    this.write(this.keys.bookings, list);
    return booking;
  },

  updateBooking(id, patch) {
    const list = this.bookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
    this.write(this.keys.bookings, list);
    return list.find((b) => b.id === id) || null;
  },

  getBooking(id) {
    return this.bookings().find((b) => b.id === id || b.code === id) || null;
  },

  myBookings() {
    const session = this.session();
    if (!session) return [];
    return this.bookings().filter((b) => b.userId === session.id || b.email === session.email);
  },

  notifications() {
    return this.read(this.keys.notifications, []);
  },

  addNotification(item) {
    const list = this.notifications();
    list.unshift(item);
    this.write(this.keys.notifications, list);
    return item;
  },

  myNotifications() {
    const session = this.session();
    if (!session) return [];
    return this.notifications().filter((n) => n.userId === session.id);
  },

  markNotificationRead(id) {
    const list = this.notifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.write(this.keys.notifications, list);
  },

  markAllNotificationsRead() {
    const session = this.session();
    if (!session) return;
    const list = this.notifications().map((n) => (n.userId === session.id ? { ...n, read: true } : n));
    this.write(this.keys.notifications, list);
  },

  addMessage(message) {
    const list = this.read(this.keys.messages, []);
    list.unshift(message);
    this.write(this.keys.messages, list);
    return message;
  }
};
