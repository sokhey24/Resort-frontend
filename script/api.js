const API_BASE = "http://localhost:8000/api";

async function fetchWebsiteContent() {
  try {
    const res  = await fetch(`${API_BASE}/website-content`, { headers: { Accept: "application/json" } });
    const json = await res.json();
    return json.data ?? {};
  } catch {
    return {};
  }
}

function applyContent(content) {
  if (!content || !Object.keys(content).length) return;

  const setText = (sel, value) => {
    if (!value) return;
    document.querySelectorAll(sel).forEach(el => { el.textContent = value; });
  };
  const setImage = (sel, url) => {
    if (!url) return;
    document.querySelectorAll(sel).forEach(el => { el.src = url; });
  };

  const setVideo = (sel, url) => {
    if (!url) return;
    document.querySelectorAll(sel).forEach(el => { el.src = url; el.load(); });
  };

  const val = (section, key) => content[section]?.[key]?.value ?? "";
  const img = (section, key) => content[section]?.[key]?.image_url ?? "";

  // HERO
  setText("[data-cms='hero.title']",    val("hero", "title"));
  setText("[data-cms='hero.subtitle']", val("hero", "subtitle"));
  setVideo("[data-cms='hero.video']",   img("hero", "video"));

  // ABOUT
  setText("[data-cms='about.title']",       val("about", "title"));
  setText("[data-cms='about.description']", val("about", "description"));
  setImage("[data-cms='about.image']",      img("about", "image"));

  // SERVICE
  setText("[data-cms='service.title']",       val("service", "title"));
  setText("[data-cms='service.description']", val("service", "description"));
  setText("[data-cms='service.card1_title']", val("service", "card1_title"));
  setText("[data-cms='service.card1_text']",  val("service", "card1_text"));
  setText("[data-cms='service.card2_title']", val("service", "card2_title"));
  setText("[data-cms='service.card2_text']",  val("service", "card2_text"));
  setText("[data-cms='service.card3_title']", val("service", "card3_title"));
  setText("[data-cms='service.card3_text']",  val("service", "card3_text"));
  setText("[data-cms='service.card4_title']", val("service", "card4_title"));
  setText("[data-cms='service.card4_text']",  val("service", "card4_text"));

  // TEAM
  setText("[data-cms='team.member1_name']",   val("team", "member1_name"));
  setText("[data-cms='team.member1_role']",   val("team", "member1_role"));
  setImage("[data-cms='team.member1_image']", img("team", "member1_image"));
  setText("[data-cms='team.member2_name']",   val("team", "member2_name"));
  setText("[data-cms='team.member2_role']",   val("team", "member2_role"));
  setImage("[data-cms='team.member2_image']", img("team", "member2_image"));
  setText("[data-cms='team.member3_name']",   val("team", "member3_name"));
  setText("[data-cms='team.member3_role']",   val("team", "member3_role"));
  setImage("[data-cms='team.member3_image']", img("team", "member3_image"));

  // CONTACT
  setText("[data-cms='contact.phone']",   val("contact", "phone"));
  setText("[data-cms='contact.email']",   val("contact", "email"));
  setText("[data-cms='contact.address']", val("contact", "address"));

  // FOOTER
  setImage("[data-cms='footer.logo']",     img("footer", "logo"));
  setText("[data-cms='footer.checkin']",   val("footer", "checkin"));
  setText("[data-cms='footer.checkout']",  val("footer", "checkout"));
  setText("[data-cms='footer.copyright']", val("footer", "copyright"));

  // BANNERS
  setImage("[data-cms='banner.banner1']", img("banner", "banner1"));
  setImage("[data-cms='banner.banner2']", img("banner", "banner2"));
  setImage("[data-cms='banner.banner3']", img("banner", "banner3"));

  // ACTIVITIES
  setText("[data-cms='activities.title']",       val("activities", "title"));
  setText("[data-cms='activities.description']", val("activities", "description"));
  setText("[data-cms='activities.card1_title']", val("activities", "card1_title"));
  setText("[data-cms='activities.card1_text']",  val("activities", "card1_text"));
  setImage("[data-cms='activities.card1_image']",img("activities", "card1_image"));
  setText("[data-cms='activities.card2_title']", val("activities", "card2_title"));
  setText("[data-cms='activities.card2_text']",  val("activities", "card2_text"));
  setImage("[data-cms='activities.card2_image']",img("activities", "card2_image"));
  setText("[data-cms='activities.card3_title']", val("activities", "card3_title"));
  setText("[data-cms='activities.card3_text']",  val("activities", "card3_text"));
  setImage("[data-cms='activities.card3_image']",img("activities", "card3_image"));
  setText("[data-cms='activities.card4_title']", val("activities", "card4_title"));
  setText("[data-cms='activities.card4_text']",  val("activities", "card4_text"));
  setImage("[data-cms='activities.card4_image']",img("activities", "card4_image"));
  setText("[data-cms='activities.card5_title']", val("activities", "card5_title"));
  setText("[data-cms='activities.card5_text']",  val("activities", "card5_text"));
  setImage("[data-cms='activities.card5_image']",img("activities", "card5_image"));
  setText("[data-cms='activities.card6_title']", val("activities", "card6_title"));
  setText("[data-cms='activities.card6_text']",  val("activities", "card6_text"));
  setImage("[data-cms='activities.card6_image']",img("activities", "card6_image"));

  // ROOMS PAGE
  setText("[data-cms='rooms.title']",       val("rooms", "title"));
  setText("[data-cms='rooms.description']", val("rooms", "description"));
  setText("[data-cms='rooms.card1_title']", val("rooms", "card1_title"));
  setImage("[data-cms='rooms.card1_image']",img("rooms", "card1_image"));
  setText("[data-cms='rooms.card2_title']", val("rooms", "card2_title"));
  setImage("[data-cms='rooms.card2_image']",img("rooms", "card2_image"));
  setText("[data-cms='rooms.card3_title']", val("rooms", "card3_title"));
  setImage("[data-cms='rooms.card3_image']",img("rooms", "card3_image"));
  setText("[data-cms='rooms.card4_title']", val("rooms", "card4_title"));
  setImage("[data-cms='rooms.card4_image']",img("rooms", "card4_image"));
  setText("[data-cms='rooms.card5_title']", val("rooms", "card5_title"));
  setImage("[data-cms='rooms.card5_image']",img("rooms", "card5_image"));
  setText("[data-cms='rooms.card6_title']", val("rooms", "card6_title"));
  setImage("[data-cms='rooms.card6_image']",img("rooms", "card6_image"));

  // ROOM DETAIL
  setText("[data-cms='roomdetail.title']",       val("roomdetail", "title"));
  setText("[data-cms='roomdetail.description']",  val("roomdetail", "description"));
  setText("[data-cms='roomdetail.price']",        val("roomdetail", "price"));
  setText("[data-cms='roomdetail.capacity']",     val("roomdetail", "capacity"));
  setText("[data-cms='roomdetail.size']",         val("roomdetail", "size"));
  setText("[data-cms='roomdetail.view']",         val("roomdetail", "view"));
  setImage("[data-cms='roomdetail.image1']",      img("roomdetail", "image1"));
  setImage("[data-cms='roomdetail.image2']",      img("roomdetail", "image2"));
  setImage("[data-cms='roomdetail.image3']",      img("roomdetail", "image3"));
  setImage("[data-cms='roomdetail.image4']",      img("roomdetail", "image4"));
  setImage("[data-cms='roomdetail.image5']",      img("roomdetail", "image5"));
}

fetchWebsiteContent().then(applyContent);
