export interface PriceUnit {
  value: string;
  label: string;
  sizes: readonly string[];
}

export interface SavedSizing {
  unit: string;
  sizes: readonly string[];
}

const SHEET_SIZES = [
  "8 x 4 ft",
  "7 x 4 ft",
  "6 x 4 ft",
  "8 x 3 ft",
  "7 x 3 ft",
  "6 x 3 ft",
  "0.8 mm",
  "1 mm",
  "1.5 mm",
  "4 mm",
  "6 mm",
  "9 mm",
  "12 mm",
  "16 mm",
  "18 mm",
  "19 mm",
  "25 mm",
];

const FITTING_SIZES = [
  "Standard",
  "25 mm",
  "35 mm",
  "50 mm",
  "65 mm",
  "75 mm",
  "100 mm",
  "2 inch",
  "3 inch",
  "4 inch",
  "5 inch",
  "6 inch",
  "8 inch",
  "10 inch",
  "12 inch",
];

export const PRICE_UNITS: readonly PriceUnit[] = [
  {
    value: "per litre",
    label: "Litre (L)",
    sizes: ["50 ml", "100 ml", "200 ml", "500 ml", "1 L", "4 L", "10 L", "20 L"],
  },
  {
    value: "per kg",
    label: "Kilogram (kg)",
    sizes: ["100 g", "250 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg", "20 kg", "25 kg", "40 kg", "50 kg"],
  },
  { value: "per sq ft", label: "Square foot (sq ft)", sizes: SHEET_SIZES },
  { value: "per sheet", label: "Sheet", sizes: SHEET_SIZES },
  { value: "per piece", label: "Piece (pc)", sizes: FITTING_SIZES },
  { value: "per pair", label: "Pair", sizes: FITTING_SIZES },
  { value: "per set", label: "Set", sizes: FITTING_SIZES },
  { value: "per box", label: "Box", sizes: ["Box of 50", "Box of 100", "Box of 200", "Box of 500", "Box of 1000"] },
  { value: "per metre", label: "Metre (m)", sizes: ["1 m", "5 m", "10 m", "25 m", "50 m", "100 m"] },
  { value: "per roll", label: "Roll", sizes: ["5 m", "10 m", "20 m", "50 m", "12 mm", "18 mm", "24 mm", "48 mm"] },
  { value: "per kit", label: "Kit", sizes: ["Kit", "Standard"] },
];

function findUnit(unit: string) {
  return PRICE_UNITS.find((option) => option.value === unit);
}

/** Units the owner can pick. A product keeps its saved unit as a choice even if it isn't in the list. */
export function unitOptions(saved?: SavedSizing): { value: string; label: string }[] {
  const options = PRICE_UNITS.map(({ value, label }) => ({ value, label }));
  if (saved?.unit && !findUnit(saved.unit)) options.push({ value: saved.unit, label: saved.unit });
  return options;
}

/** Sizes offered for a unit. Sizes already saved with that unit stay available so editing never drops them. */
export function sizesForUnit(unit: string, saved?: SavedSizing): string[] {
  const listed = findUnit(unit)?.sizes ?? [];
  const kept = saved && saved.unit === unit ? saved.sizes.filter((size) => !listed.includes(size)) : [];
  return [...listed, ...kept];
}

export function isAllowedUnit(unit: string, saved?: SavedSizing) {
  return Boolean(findUnit(unit)) || (saved !== undefined && saved.unit === unit && unit !== "");
}

export function sortSizes(sizes: readonly string[], unit: string, saved?: SavedSizing) {
  const order = sizesForUnit(unit, saved);
  return [...new Set(sizes)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
