const SolaraData = {
  resort: {
    name: "Solara Resort",
    tagline: "Gulf light, garden villas, and a kitchen that cooks for the coast.",
    phone: "(+855) 78 888 090",
    email: "info@solararesort.com",
    address: "Coastal Road, Sihanoukville, Cambodia",
    checkIn: "14:00",
    checkOut: "12:00",
    hours: "Front desk open 24 hours"
  },
  rates: {
    serviceCharge: 0.1,
    tax: 0.1
  },
  images: {
    hero: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1800&q=80",
    pool: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
    spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
    ocean: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    dining: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    lobby: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  },
  rooms: [
    {
      id: "junior-villa",
      code: "JV-101",
      name: "Junior Villa One Bedroom",
      roomType: "Villa",
      description:
        "A private one-bedroom villa with a lounge, rainfall shower, and quiet garden terrace. Designed for couples who want space without a full family villa.",
      pricePerNight: 120,
      capacity: 2,
      adults: 2,
      children: 0,
      size: "48 sqm",
      bedType: "King",
      amenities: ["Garden terrace", "Rainfall shower", "Wi-Fi", "Air conditioning", "Mini bar"],
      images: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
      ],
      rating: 4.8,
      reviewCount: 126,
      longDescription:
        "The junior villa sits in a quiet garden court, a short walk from the pool and the gulf path. Inside you get a full king bedroom, a sitting lounge for late arrivals, and a rainfall shower with plenty of hot water after beach days. Morning light hits the terrace first, so coffee outside is the usual start. Housekeeping restocks water and linens daily. This is the couple’s room: two adults, no extra beds, and enough space that you never feel boxed into a standard deluxe.",
      reviews: [
        { name: "Mika Chen", stars: 5, text: "Quiet terrace and a real lounge, not just a bed against the wall. We slept well both nights." },
        { name: "Rithy S.", stars: 5, text: "Rainfall shower and garden view made the stay feel like a villa, not a hotel room." },
        { name: "Elena P.", stars: 4, text: "Loved the space. Only note is the path to the beach is a few minutes on foot." }
      ],
      available: true,
      featured: true
    },
    {
      id: "premium-sea",
      code: "PS-204",
      name: "Premium Triple Balcony Sea View",
      roomType: "Premium",
      description:
        "Wide balcony facing the gulf, two sleeping areas, and a sitting corner for morning coffee. Best pick for small families.",
      pricePerNight: 150,
      capacity: 3,
      adults: 2,
      children: 1,
      size: "56 sqm",
      bedType: "King + single",
      amenities: ["Ocean view", "Balcony", "Wi-Fi", "Air conditioning", "Bathtub", "Work desk"],
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
      ],
      rating: 4.7,
      reviewCount: 98,
      longDescription:
        "This premium room faces the gulf with a wide balcony for three. A king bed and a single sleeping area share the same airy layout, so a small family or two friends plus a child can stay together without booking a full villa. The bathtub is the extra that deluxe rooms skip. Bring a morning coffee onto the balcony — most guests say that is why they rebook this type. Evening wind off the water can be strong, so the blackout curtains earn their keep.",
      reviews: [
        { name: "David K.", stars: 5, text: "Balcony over the gulf is the reason we came back. Plenty of room for our daughter’s bed." },
        { name: "Sreypov L.", stars: 5, text: "Bathtub after the beach was perfect. Staff left extra towels without us asking." },
        { name: "Jonas M.", stars: 4, text: "Great view. The sitting corner is small but enough for breakfast trays." }
      ],
      available: true,
      featured: true
    },
    {
      id: "deluxe-twin",
      code: "DT-118",
      name: "Deluxe Twin Room",
      roomType: "Deluxe",
      description: "Twin beds, blackout curtains, and a work desk. Ideal for friends or colleagues sharing a stay.",
      pricePerNight: 130,
      capacity: 2,
      adults: 2,
      children: 0,
      size: "36 sqm",
      bedType: "Twin",
      amenities: ["Pool view", "Wi-Fi", "Air conditioning", "Work desk", "Blackout curtains"],
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80"
      ],
      rating: 4.5,
      reviewCount: 74,
      longDescription:
        "Two proper twin beds, a desk that actually holds a laptop, and a pool-facing window. Friends and work trips use this room most. Blackout curtains keep the morning pool noise down. Storage is split so each guest has a rail and a drawer. It is not a suite — it is a clean deluxe twin that does the job without charging villa money.",
      reviews: [
        { name: "Arun V.", stars: 5, text: "Twin beds were actually comfortable. Desk was useful before dinner." },
        { name: "Paige T.", stars: 4, text: "Quiet at night. Pool view is pretty; you still hear some daytime splash." },
        { name: "Kim H.", stars: 4, text: "Good value for two colleagues. Shower pressure was strong." }
      ],
      available: true,
      featured: false
    },
    {
      id: "deluxe-double",
      code: "DD-110",
      name: "Deluxe Double Room",
      roomType: "Deluxe",
      description: "King bed, warm lighting, and a compact lounge. A calm base after beach days.",
      pricePerNight: 120,
      capacity: 2,
      adults: 2,
      children: 0,
      size: "34 sqm",
      bedType: "King",
      amenities: ["Garden view", "Wi-Fi", "Air conditioning", "Mini bar", "Rainfall shower"],
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ],
      rating: 4.6,
      reviewCount: 81,
      longDescription:
        "A classic king deluxe with warm lighting and a compact lounge chair. Garden side of the building stays cooler in the afternoon. The rainfall shower is the same spec as the junior villa, just in a smaller footprint. Best if you want a proper bed and a calm room after long beach hours, without paying for a terrace villa.",
      reviews: [
        { name: "Lina O.", stars: 5, text: "King bed was excellent. Room felt calm and dark at night." },
        { name: "Vannak C.", stars: 5, text: "Garden view, easy walk to breakfast. Mini bar prices were fair." },
        { name: "Tom B.", stars: 4, text: "Small lounge but enough. Would book again for a two-night break." }
      ],
      available: true,
      featured: false
    },
    {
      id: "prince-villa",
      code: "PV-401",
      name: "Prince Villa 4 Bedrooms",
      roomType: "Villa",
      description: "Four bedrooms, private dining, and a plunge pool. Built for family gatherings and longer stays.",
      pricePerNight: 240,
      capacity: 8,
      adults: 6,
      children: 2,
      size: "180 sqm",
      bedType: "4 kings",
      amenities: ["Plunge pool", "Private dining", "Kitchen", "Wi-Fi", "Air conditioning", "Garden"],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ],
      rating: 4.9,
      reviewCount: 54,
      longDescription:
        "Four bedrooms, a private dining table, a kitchen, and a plunge pool in the garden. This is the house for family gatherings and longer stays — not a hotel room with extra beds. Each bedroom closes properly, so grandparents and kids can keep different hours. Staff can set breakfast in the villa if you ask the desk the night before. Expect more walking around the property; you are in the lagoon gardens, not next to the lobby.",
      reviews: [
        { name: "The Meas family", stars: 5, text: "Eight of us had space. Plunge pool kept the children happy all afternoon." },
        { name: "Claire W.", stars: 5, text: "Private dining made dinners easy. Kitchen was stocked with basics." },
        { name: "Dara P.", stars: 4, text: "Beautiful villa. Golf cart from lobby would help with luggage." }
      ],
      available: true,
      featured: true
    },
    {
      id: "deluxe-one",
      code: "DO-102",
      name: "Deluxe One Room",
      roomType: "Deluxe",
      description: "Compact deluxe room with smart storage and a walk-in shower. Best value for a short escape.",
      pricePerNight: 110,
      capacity: 2,
      adults: 2,
      children: 0,
      size: "28 sqm",
      bedType: "Queen",
      amenities: ["Courtyard view", "Wi-Fi", "Air conditioning", "Walk-in shower"],
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522771737031-b90b3581c3c4?auto=format&fit=crop&w=1200&q=80"
      ],
      rating: 4.3,
      reviewCount: 63,
      longDescription:
        "The smallest deluxe on the list — a queen bed, smart storage, and a walk-in shower. Courtyard view, so you get light without the gulf price. Built for a short stay: one or two nights, two adults, no extra furniture. If you want a lounge or a bathtub, step up to deluxe double or the junior villa.",
      reviews: [
        { name: "Nita K.", stars: 4, text: "Clean and compact. Perfect for one night before the ferry." },
        { name: "Sam R.", stars: 5, text: "Shower was great. Courtyard is quiet compared with the pool wing." },
        { name: "Bopha M.", stars: 4, text: "Fair price. Room is small, as described — no surprise." }
      ],
      available: true,
      featured: false
    }
  ],
  activities: [
    {
      id: "jet-ski",
      name: "Jet Ski Adventures",
      description: "Guided coastal runs with safety briefing and life jackets.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      duration: "45 minutes",
      price: 45,
      location: "Main beach",
      availability: "Daily 08:00–16:00",
      category: "Water"
    },
    {
      id: "kayaking",
      name: "Kayaking",
      description: "Calm-water kayak along mangroves at sunrise.",
      image: "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?auto=format&fit=crop&w=1200&q=80",
      duration: "90 minutes",
      price: 22,
      location: "Mangrove inlet",
      availability: "Daily 06:00–09:00",
      category: "Water"
    },
    {
      id: "beach-party",
      name: "Beach Party",
      description: "Weekly sunset DJ set, fire show, and mocktail bar.",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      duration: "3 hours",
      price: 0,
      location: "Sunset beach",
      availability: "Fridays from 17:00",
      category: "Nightlife"
    },
    {
      id: "resort-tour",
      name: "Resort Tour",
      description: "Walk the gardens, spa, and heritage lookout with a host.",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      duration: "60 minutes",
      price: 0,
      location: "Lobby",
      availability: "Daily 10:00 and 16:00",
      category: "Culture"
    },
    {
      id: "water-park",
      name: "Water Park",
      description: "Slides and a kids lagoon open 09:00–18:00.",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
      duration: "Full day",
      price: 18,
      location: "East gardens",
      availability: "Daily 09:00–18:00",
      category: "Family"
    },
    {
      id: "infinity-pool",
      name: "Infinity Pool",
      description: "Heated infinity edge with poolside cabanas.",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
      duration: "Open access",
      price: 0,
      location: "Main deck",
      availability: "Daily 07:00–20:00",
      category: "Wellness"
    }
  ],
  services: [
    { id: "pool", name: "Swimming Pool", description: "Take a dip into our infinity swimming pool.", icon: "fa-person-swimming", price: 0 },
    { id: "wifi", name: "Free Wi-Fi", description: "Offer free Wi-Fi throughout the resort.", icon: "fa-wifi", price: 0 },
    { id: "transfer", name: "Ferry Service", description: "Ferry ticket arrangement is available here.", icon: "fa-ship", price: 35 },
    { id: "dining-svc", name: "Food & Drink", description: "Great offers on a range of food and drinks.", icon: "fa-martini-glass", price: 0 },
    { id: "spa", name: "Spa & Wellness", description: "Khmer massage, steam, and yoga deck.", icon: "fa-spa", price: 40 },
    { id: "concierge", name: "24h Concierge", description: "Tours, tickets, and guest requests anytime.", icon: "fa-concierge-bell", price: 0 },
    { id: "gym", name: "Fitness Studio", description: "Open gym with ocean-view cardio zone.", icon: "fa-dumbbell", price: 0 },
    { id: "family", name: "Family Care", description: "Cribs, kids club, and babysitting on request.", icon: "fa-baby", price: 15 }
  ],
  dining: {
    restaurant: {
      name: "Gulf Kitchen",
      hours: "Breakfast 06:30–10:30 · Lunch 12:00–15:00 · Dinner 18:00–22:00",
      description: "Market seafood, Khmer classics, and a short European grill."
    },
    categories: [
      {
        id: "breakfast",
        name: "Breakfast",
        items: [
          { id: "kuy-teav", name: "Khmer Noodle Soup", price: 8, description: "Pork broth, rice noodles, herbs.", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80", available: true },
          { id: "fruit", name: "Tropical Fruit Plate", price: 6, description: "Mango, pineapple, dragon fruit.", image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80", available: true },
          { id: "benedict", name: "Eggs Benedict", price: 10, description: "English muffin, hollandaise.", image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80", available: true }
        ]
      },
      {
        id: "lunch",
        name: "Lunch",
        items: [
          { id: "barra", name: "Grilled Barramundi", price: 18, description: "Lime leaf butter, garden greens.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", available: true },
          { id: "bowl", name: "Garden Bowl", price: 12, description: "Rice, greens, pickled vegetables.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", available: true },
          { id: "club", name: "Club Sandwich", price: 11, description: "Chicken, bacon, toasted sourdough.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80", available: true }
        ]
      },
      {
        id: "dinner",
        name: "Dinner",
        items: [
          { id: "crab", name: "Pepper Crab", price: 28, description: "Kampot pepper, steamed bun.", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80", available: true },
          { id: "wagyu", name: "Wagyu Tenderloin", price: 36, description: "Charred greens, red wine jus.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", available: false },
          { id: "amok", name: "Amok Fish", price: 16, description: "Coconut curry steamed in banana leaf.", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80", available: true }
        ]
      }
    ]
  },
  gallery: [
    { id: "g1", title: "Junior villa", category: "Rooms", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", description: "Garden villa at dusk." },
    { id: "g2", title: "Sea suite", category: "Rooms", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", description: "Balcony over the gulf." },
    { id: "g3", title: "Infinity pool", category: "Facilities", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80", description: "Heated edge pool." },
    { id: "g4", title: "Gulf Kitchen", category: "Dining", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80", description: "Evening service." },
    { id: "g5", title: "Spa", category: "Facilities", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80", description: "Khmer massage suite." },
    { id: "g6", title: "Beach", category: "Grounds", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", description: "Morning shoreline." },
    { id: "g7", title: "Lobby", category: "Grounds", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", description: "Arrival court." },
    { id: "g8", title: "Pathways", category: "Grounds", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", description: "Garden walk." }
  ],
  team: [
    { id: "t1", name: "Alex Johnson", position: "Resort Manager", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80", description: "Hosts the property and guest experience." },
    { id: "t2", name: "Cheng Dara", position: "Housekeeping Supervisor", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80", description: "Keeps villas and rooms guest-ready." },
    { id: "t3", name: "Sokha Meas", position: "Front Desk Supervisor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", description: "Arrivals, keys, and local advice." }
  ],
  promotions: [
    { code: "SOLARA10", discountType: "percent", discountValue: 10, minimumNights: 1, minChildren: 0, expiration: "2027-12-31", active: true, headline: "10% off every stay", detail: "On Junior Villa, SOLARA10 turns $120 into $108 for one night before tax and service." },
    { code: "STAY3", discountType: "percent", discountValue: 12, minimumNights: 3, minChildren: 0, expiration: "2027-12-31", active: true, headline: "Stay 3 nights, save 12%", detail: "Valid on stays of three nights or more." },
    { code: "FAMILY", discountType: "percent", discountValue: 8, minimumNights: 1, minChildren: 1, expiration: "2027-12-31", active: true, headline: "Family rate", detail: "8% off when the stay includes at least one child." }
  ],
  testimonials: [
    { id: "r1", name: "Mika Chen", quote: "The junior villa was quiet, and breakfast on the terrace felt like a proper holiday.", rating: 5 },
    { id: "r2", name: "David K.", quote: "Front desk sorted a late ferry without fuss. We will book the sea balcony again.", rating: 5 },
    { id: "r3", name: "Sreypov L.", quote: "Kids lived in the water park. The prince villa gave everyone a door to close.", rating: 4 }
  ],
  about: {
    story: "Solara sits on the Cambodian coast with villas in the gardens and a kitchen that sources from the morning market.",
    mission: "Give guests a complete stay — rest, food, water, and a simple way to book — without turning this public site into a staff dashboard.",
    values: ["Calm hospitality", "Local cooking", "Clear guest information", "Privacy for families"]
  }
};

/* ------------------------------------------------------------------ *
 * Multi-resort layer (Agoda-inspired booking workflow, original RMS)
 * Added on top of the existing single-property data so every legacy
 * page keeps working while new pages get a full resort catalogue.
 * ------------------------------------------------------------------ */

// Display currencies for the header currency selector.
SolaraData.currencies = {
  USD: { code: "USD", symbol: "$", rate: 1, decimals: 2 },
  KHR: { code: "KHR", symbol: "៛", rate: 4100, decimals: 0 }
};

// Facilities catalogue reused by resort cards, filters and detail pages.
SolaraData.facilities = [
  { id: "pool", name: "Swimming Pool", icon: "fa-person-swimming" },
  { id: "wifi", name: "Free Wi-Fi", icon: "fa-wifi" },
  { id: "restaurant", name: "Restaurant", icon: "fa-utensils" },
  { id: "parking", name: "Free Parking", icon: "fa-square-parking" },
  { id: "spa", name: "Spa", icon: "fa-spa" },
  { id: "gym", name: "Fitness Center", icon: "fa-dumbbell" },
  { id: "transfer", name: "Airport Transfer", icon: "fa-van-shuttle" },
  { id: "breakfast", name: "Breakfast", icon: "fa-mug-saucer" },
  { id: "beach", name: "Beachfront", icon: "fa-umbrella-beach" },
  { id: "bar", name: "Bar", icon: "fa-martini-glass" }
];

// Assign each existing room to one of the new resorts.
const _roomResortMap = {
  "junior-villa": "sokha-beach",
  "premium-sea": "ocean-breeze",
  "deluxe-twin": "riverside-retreat",
  "deluxe-double": "paradise-island",
  "prince-villa": "mountain-view",
  "deluxe-one": "sokha-beach"
};
SolaraData.rooms.forEach((room) => {
  room.resortId = _roomResortMap[room.id] || "sokha-beach";
  room.freeCancellation = room.pricePerNight <= 150;
  room.breakfastIncluded = room.roomType === "Villa" || room.roomType === "Premium";
  room.roomsLeft = ((room.pricePerNight % 4) + 2);
});

// Extra rooms so every resort has several room types (Deluxe, Superior,
// Family, Villa, Suite). Kept compact but schema-compatible.
const _img = {
  deluxe: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  suite: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  family: "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=1200&q=80",
  superior: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  villa: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80",
  room: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
};

function _mkRoom(o) {
  return {
    id: o.id,
    code: o.code,
    name: o.name,
    roomType: o.roomType,
    resortId: o.resortId,
    description: o.description,
    pricePerNight: o.pricePerNight,
    discountPercent: o.discountPercent ?? 0,
    discountedPricePerNight:
      o.discountedPricePerNight ??
      (o.discountPercent
        ? Math.round(o.pricePerNight * (1 - (o.discountPercent ?? 0) / 100) * 100) / 100
        : o.pricePerNight),
    capacity: o.capacity,
    adults: o.adults,
    children: o.children,
    size: o.size,
    bedType: o.bedType,
    amenities: o.amenities,
    images: o.images,
    rating: o.rating,
    reviewCount: o.reviewCount,
    longDescription: o.longDescription || o.description,
    reviews: o.reviews || [{ name: "Verified guest", stars: Math.round(o.rating), text: "Clean room, friendly staff, would book again." }],
    available: true,
    featured: Boolean(o.featured),
    freeCancellation: o.freeCancellation !== false,
    breakfastIncluded: Boolean(o.breakfastIncluded),
    roomsLeft: o.roomsLeft || 4
  };
}

SolaraData.rooms.push(
  _mkRoom({ id: "sokha-superior", code: "SB-SUP", name: "Superior Ocean Room", roomType: "Superior", resortId: "sokha-beach", description: "Bright room with a partial sea view and a walk-out balcony.", pricePerNight: 95, capacity: 2, adults: 2, children: 1, size: "32 sqm", bedType: "Queen", amenities: ["Balcony", "Wi-Fi", "Air conditioning", "Mini bar"], images: [_img.superior, _img.room], rating: 4.4, reviewCount: 58, breakfastIncluded: true }),
  _mkRoom({ id: "sokha-family", code: "SB-FAM", name: "Family Beach Room", roomType: "Family", resortId: "sokha-beach", description: "Two double beds and space for the kids, steps from the sand.", pricePerNight: 165, capacity: 4, adults: 2, children: 2, size: "44 sqm", bedType: "2 Doubles", amenities: ["Sea view", "Wi-Fi", "Air conditioning", "Bathtub"], images: [_img.family, _img.room], rating: 4.6, reviewCount: 71, featured: true, breakfastIncluded: true }),
  _mkRoom({ id: "river-superior", code: "RR-SUP", name: "Riverside Superior", roomType: "Superior", resortId: "riverside-retreat", description: "Calm river-facing room with a private reading nook.", pricePerNight: 88, capacity: 2, adults: 2, children: 0, size: "30 sqm", bedType: "Queen", amenities: ["River view", "Wi-Fi", "Air conditioning"], images: [_img.superior, _img.room], rating: 4.3, reviewCount: 42 }),
  _mkRoom({ id: "river-family", code: "RR-FAM", name: "Riverside Family Suite", roomType: "Family", resortId: "riverside-retreat", description: "A two-room suite with a lounge overlooking the Kampot river.", pricePerNight: 175, capacity: 5, adults: 3, children: 2, size: "60 sqm", bedType: "King + 2 singles", amenities: ["River view", "Wi-Fi", "Kitchenette", "Balcony"], images: [_img.family, _img.suite], rating: 4.7, reviewCount: 39, featured: true, breakfastIncluded: true }),
  _mkRoom({ id: "paradise-villa", code: "PI-VIL", name: "Overwater Villa", roomType: "Villa", resortId: "paradise-island", description: "Private overwater villa with a deck straight onto the lagoon.", pricePerNight: 320, capacity: 2, adults: 2, children: 0, size: "70 sqm", bedType: "King", amenities: ["Lagoon deck", "Wi-Fi", "Air conditioning", "Outdoor shower", "Mini bar"], images: [_img.villa, _img.suite], rating: 4.9, reviewCount: 88, featured: true, freeCancellation: false, breakfastIncluded: true }),
  _mkRoom({ id: "paradise-suite", code: "PI-SUI", name: "Island Junior Suite", roomType: "Suite", resortId: "paradise-island", description: "Corner suite with a wraparound view of Koh Rong.", pricePerNight: 210, capacity: 3, adults: 2, children: 1, size: "52 sqm", bedType: "King", amenities: ["Sea view", "Wi-Fi", "Bathtub", "Lounge"], images: [_img.suite, _img.room], rating: 4.7, reviewCount: 46, breakfastIncluded: true }),
  _mkRoom({ id: "mountain-deluxe", code: "MV-DLX", name: "Deluxe Mountain Room", roomType: "Deluxe", resortId: "mountain-view", description: "Warm timber room with a balcony over the Mondulkiri hills.", pricePerNight: 92, capacity: 2, adults: 2, children: 1, size: "34 sqm", bedType: "Queen", amenities: ["Mountain view", "Wi-Fi", "Heater", "Balcony"], images: [_img.deluxe, _img.room], rating: 4.5, reviewCount: 51, breakfastIncluded: true }),
  _mkRoom({ id: "mountain-suite", code: "MV-SUI", name: "Highland Suite", roomType: "Suite", resortId: "mountain-view", description: "Suite with a fireplace lounge and panoramic valley windows.", pricePerNight: 185, capacity: 3, adults: 2, children: 1, size: "58 sqm", bedType: "King", amenities: ["Valley view", "Wi-Fi", "Fireplace", "Bathtub"], images: [_img.suite, _img.deluxe], rating: 4.8, reviewCount: 33, featured: true, freeCancellation: false, breakfastIncluded: true }),
  _mkRoom({ id: "ocean-family", code: "OB-FAM", name: "Ocean Family Room", roomType: "Family", resortId: "ocean-breeze", description: "Spacious family room with bunk nook and a gulf-facing balcony.", pricePerNight: 155, capacity: 4, adults: 2, children: 2, size: "46 sqm", bedType: "King + bunk", amenities: ["Sea view", "Wi-Fi", "Air conditioning", "Balcony"], images: [_img.family, _img.room], rating: 4.5, reviewCount: 60, breakfastIncluded: true }),
  _mkRoom({ id: "ocean-suite", code: "OB-SUI", name: "Breeze Panorama Suite", roomType: "Suite", resortId: "ocean-breeze", description: "Top-floor suite with a wide terrace facing the Kep coastline.", pricePerNight: 230, capacity: 3, adults: 2, children: 1, size: "62 sqm", bedType: "King", amenities: ["Panorama view", "Wi-Fi", "Bathtub", "Terrace", "Mini bar"], images: [_img.suite, _img.superior], rating: 4.9, reviewCount: 41, featured: true, freeCancellation: false, breakfastIncluded: true })
);

// The five resorts of the RMS network.
SolaraData.resorts = [
  {
    id: "sokha-beach",
    name: "Sokha Beach Resort",
    city: "Sihanoukville",
    country: "Cambodia",
    address: "Coastal Road, Sihanoukville, Cambodia",
    type: "Beachfront",
    rating: 4.7,
    reviewCount: 384,
    stars: 5,
    description: "A flagship beachfront resort with garden villas, an infinity pool, and direct access to a quiet stretch of gulf sand.",
    tagline: "Beachfront villas on the gulf.",
    facilities: ["pool", "wifi", "restaurant", "parking", "spa", "gym", "beach", "breakfast"],
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80"
    ],
    featured: true,
    promoTag: "Save 10% with SOLARA10"
  },
  {
    id: "riverside-retreat",
    name: "Riverside Retreat",
    city: "Kampot",
    country: "Cambodia",
    address: "River Lane, Kampot, Cambodia",
    type: "Riverside",
    rating: 4.5,
    reviewCount: 212,
    stars: 4,
    description: "A calm riverside retreat framed by pepper farms, with hammock decks, kayaks, and slow sunset dinners on the water.",
    tagline: "Slow days by the Kampot river.",
    facilities: ["wifi", "restaurant", "parking", "spa", "breakfast", "bar"],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1400&q=80"
    ],
    featured: true,
    promoTag: "Free kayak with breakfast"
  },
  {
    id: "paradise-island",
    name: "Paradise Island Resort",
    city: "Koh Rong",
    country: "Cambodia",
    address: "Long Beach, Koh Rong, Cambodia",
    type: "Island",
    rating: 4.8,
    reviewCount: 297,
    stars: 5,
    description: "Overwater villas and a white-sand lagoon on Koh Rong, reached by a short resort ferry from the mainland.",
    tagline: "Overwater villas on Koh Rong.",
    facilities: ["pool", "wifi", "restaurant", "spa", "transfer", "beach", "breakfast", "bar"],
    images: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80"
    ],
    featured: true,
    promoTag: "Stay 3, save 12% with STAY3"
  },
  {
    id: "mountain-view",
    name: "Mountain View Resort",
    city: "Mondulkiri",
    country: "Cambodia",
    address: "Highland Road, Sen Monorom, Mondulkiri, Cambodia",
    type: "Mountain",
    rating: 4.6,
    reviewCount: 148,
    stars: 4,
    description: "A cool highland lodge above pine valleys and waterfalls, with fireplaces, forest trails, and quiet nights.",
    tagline: "Cool nights in the highlands.",
    facilities: ["wifi", "restaurant", "parking", "gym", "breakfast", "bar"],
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80"
    ],
    featured: false,
    promoTag: "Family rate with FAMILY"
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze Resort",
    city: "Kep",
    country: "Cambodia",
    address: "Crab Market Road, Kep, Cambodia",
    type: "Beachfront",
    rating: 4.6,
    reviewCount: 203,
    stars: 4,
    description: "A breezy coastal resort by the Kep crab market, with sea-view suites, a rooftop bar, and fresh seafood nightly.",
    tagline: "Sea-view suites in Kep.",
    facilities: ["pool", "wifi", "restaurant", "parking", "beach", "breakfast", "bar", "transfer"],
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
    ],
    featured: true,
    promoTag: "Rooftop welcome drink"
  }
];
