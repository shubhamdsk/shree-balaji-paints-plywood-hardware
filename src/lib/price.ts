const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatPrice(priceFrom: number | undefined, unit = "") {
  if (priceFrom === undefined) return "Ask for price";
  return `From ${rupees.format(priceFrom)}${unit ? ` ${unit}` : ""}`;
}
