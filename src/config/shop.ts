const phone = "7038499108";

export const shop = {
  name: "Shree Balaji Paints Plywood & Hardware",
  shortName: "Shree Balaji",
  tagline: "Paints, Plywood & Hardware",
  marathi: {
    fullName: "श्री बालाजी पेंट्स प्लायवुड & हार्डवेअर",
    prefix: "श्री",
    name: "बालाजी",
    tagline: "पेंट्स प्लायवुड & हार्डवेअर",
  },
  hoursShort: "8:00 AM – 9:00 PM",
  openDays: "Open all 7 days",
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
