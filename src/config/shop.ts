const phone = "7038499108";

export const shop = {
  name: "Shree Balaji Paints Plywood and Hardware",
  shortName: "Shree Balaji",
  tagline: "Paints, Plywood & Hardware",
  marathi: {
    prefix: "श्री",
    name: "बालाजी",
    tagline: "पेंट्स् प्लायवुड & हार्डवेअर",
  },
  phone,
  phoneDisplay: "+91 70384 99108",
  phoneLink: `tel:+91${phone}`,
  whatsappNumber: `91${phone}`,
  address: {
    line1: "CXM9+4JF",
    city: "Kotul",
    state: "Maharashtra",
    pincode: "422610",
  },
  mapLink: "https://maps.app.goo.gl/hQ4KTEewDSLMKXCQ7",
  hours: "Mon - Sun: 8:00 AM - 9:00 PM",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
