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
