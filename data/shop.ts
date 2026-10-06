const phone = "9284463701";

export const shop = {
  name: "Shree Balaji Paints Plywood and Hardware",
  shortName: "Shree Balaji",
  tagline: "Paints, Plywood & Hardware",
  phone,
  phoneDisplay: "+91 92844 63701",
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
