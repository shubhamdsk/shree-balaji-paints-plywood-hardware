import { shop } from "@/config/shop";
import type { Product } from "@/types";

export type LengthUnit = "ft" | "m";

// Conservative per-coat figures on a smooth, primed wall; brand datasheets vary with surface and dilution.
export const COVERAGE_SQFT_PER_LITRE: Record<string, number> = {
  Interior: 110,
  "Interior Emulsion": 110,
  Exterior: 55,
  "Exterior Emulsion": 55,
  Primer: 100,
  "Wall Primer": 100,
  Waterproofing: 35,
  "Waterproofing Paint": 35,
};

const DOOR_SQFT = 21;
const WINDOW_SQFT = 12;
const FEET_PER_METRE = 3.28084;
const MAX_DIMENSION_FT = 200;
const MAX_OPENINGS = 20;

export interface RoomValues {
  productId: string;
  unit: LengthUnit;
  length: string;
  width: string;
  height: string;
  doors: string;
  windows: string;
  coats: string;
  includeCeiling: boolean;
}

export type RoomErrors = Partial<Record<keyof RoomValues, string>>;

export interface PackLine {
  label: string;
  count: number;
}

export interface PaintEstimate {
  areaSqft: number;
  litres: number;
  packs: PackLine[];
}

export function isCalculablePaint(product: Pick<Product, "category" | "type" | "sizes">) {
  return (
    (product.category === "paints" || product.category === "paint-preparation") &&
    product.type in COVERAGE_SQFT_PER_LITRE &&
    product.sizes.some((size) => parseMillilitres(size) !== null)
  );
}

export function parseMillilitres(size: string): number | null {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(ml|l)\s*$/i.exec(size);
  if (!match) return null;
  const amount = Number(match[1]);
  return Math.round(match[2].toLowerCase() === "l" ? amount * 1000 : amount);
}

function toFeet(value: number, unit: LengthUnit) {
  return unit === "m" ? value * FEET_PER_METRE : value;
}

function wallAreaSqft(values: RoomValues) {
  const [length, width, height] = [values.length, values.width, values.height].map((v) =>
    toFeet(Number(v), values.unit),
  );
  const walls = 2 * (length + width) * height - Number(values.doors) * DOOR_SQFT - Number(values.windows) * WINDOW_SQFT;
  return { walls, ceiling: length * width };
}

export function validateRoom(values: RoomValues): RoomErrors {
  const errors: RoomErrors = {};
  if (!values.productId) errors.productId = "Choose a paint.";

  const maxDimension = values.unit === "m" ? Math.floor(MAX_DIMENSION_FT / FEET_PER_METRE) : MAX_DIMENSION_FT;
  for (const key of ["length", "width", "height"] as const) {
    const value = Number(values[key]);
    if (!values[key].trim() || !Number.isFinite(value) || value <= 0) {
      errors[key] = "Enter a size greater than 0.";
    } else if (value > maxDimension) {
      errors[key] = `Enter ${maxDimension} ${values.unit} or less.`;
    }
  }

  for (const key of ["doors", "windows"] as const) {
    const value = Number(values[key]);
    if (!Number.isInteger(value) || value < 0 || value > MAX_OPENINGS) {
      errors[key] = `Enter a whole number from 0 to ${MAX_OPENINGS}.`;
    }
  }

  if (!errors.length && !errors.width && !errors.height && !errors.doors && !errors.windows) {
    if (wallAreaSqft(values).walls <= 0) errors.doors = "Doors and windows are larger than the walls.";
  }
  return errors;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function suggestPacks(litresNeeded: number, sizes: string[]): PackLine[] {
  const packs = sizes.flatMap((label) => {
    const ml = parseMillilitres(label);
    return ml ? [{ label, ml }] : [];
  });
  if (packs.length === 0 || litresNeeded <= 0) return [];

  const step = packs.map((p) => p.ml).reduce(gcd);
  const units = packs.map((p) => p.ml / step);
  const target = Math.ceil((litresNeeded * 1000) / step);
  const limit = target + Math.max(...units);

  const fewestCans = new Array<number>(limit + 1).fill(Infinity);
  const lastPack = new Array<number>(limit + 1).fill(-1);
  fewestCans[0] = 0;
  for (let volume = 1; volume <= limit; volume++) {
    units.forEach((size, index) => {
      if (size <= volume && fewestCans[volume - size] + 1 < fewestCans[volume]) {
        fewestCans[volume] = fewestCans[volume - size] + 1;
        lastPack[volume] = index;
      }
    });
  }

  let volume = target;
  while (fewestCans[volume] === Infinity) volume++;

  const counts = new Map<number, number>();
  for (; volume > 0; volume -= units[lastPack[volume]]) {
    counts.set(lastPack[volume], (counts.get(lastPack[volume]) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => packs[b].ml - packs[a].ml)
    .map(([index, count]) => ({ label: packs[index].label, count }));
}

export function estimatePaint(values: RoomValues, product: Pick<Product, "type" | "sizes">): PaintEstimate {
  const { walls, ceiling } = wallAreaSqft(values);
  const areaSqft = Math.round(walls + (values.includeCeiling ? ceiling : 0));
  const litres = Math.ceil((areaSqft * Number(values.coats)) / COVERAGE_SQFT_PER_LITRE[product.type]);
  return { areaSqft, litres, packs: suggestPacks(litres, product.sizes) };
}

export function formatPacks(packs: PackLine[]) {
  return packs.map((p) => `${p.count} × ${p.label}`).join(" + ");
}

export function buildEstimateMessage(values: RoomValues, estimate: PaintEstimate, productLabel: string) {
  const size = `${values.length} × ${values.width} × ${values.height} ${values.unit}`;
  return [
    `Hello ${shop.shortName}, I used the paint calculator on your website.`,
    `Paint: ${productLabel}`,
    `Room: ${size}, ${Number(values.doors)} door(s), ${Number(values.windows)} window(s)${values.includeCeiling ? ", ceiling included" : ""}`,
    `Coats: ${values.coats}`,
    `Area: about ${estimate.areaSqft} sq ft`,
    `Estimate: about ${estimate.litres} L (${formatPacks(estimate.packs)})`,
    "Please confirm the quantity and price.",
  ].join("\n");
}
