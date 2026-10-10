import { shop } from "@/config/shop";
import { siteUrl } from "@/config/site";

export default function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["HardwareStore", "PaintStore"],
    name: shop.name,
    alternateName: [shop.shortName, shop.marathi.fullName],
    url: siteUrl,
    telephone: shop.phoneDisplay,
    priceRange: "₹₹",
    hasMap: shop.mapLink,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address.line1,
      addressLocality: shop.address.city,
      addressRegion: shop.address.state,
      postalCode: shop.address.pincode,
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "21:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
