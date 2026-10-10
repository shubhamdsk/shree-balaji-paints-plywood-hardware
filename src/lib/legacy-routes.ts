// next.config.ts imports this file before the @/ alias exists, so it must not import anything.

export const LEGACY_CATEGORY_IDS = ["plywood", "hardware", "plumbing", "electrical", "tools", "adhesives"];

const typeMoves: [from: string, to: string][] = [
  ["/products/paints/interior", "/products/paints/interior-emulsion"],
  ["/products/paints/exterior", "/products/paints/exterior-emulsion"],
  ["/products/paints/wood-coatings", "/products/paints/wood-paint"],
  ["/products/paints/metal-paints", "/products/paints/metal-paint"],
  ["/products/paints/enamel", "/products/paints/enamel-paint"],
  ["/products/paints/waterproofing", "/products/paints/waterproofing-paint"],
  ["/products/paints/primer", "/products/paint-preparation/wall-primer"],
  ["/products/paints/putty", "/products/paint-preparation/wall-putty"],
  ["/products/plywood/marine", "/products/plywood-boards/bwp-marine-plywood"],
  ["/products/plywood/commercial", "/products/plywood-boards/commercial-plywood"],
  ["/products/plywood/block-board", "/products/plywood-boards/block-board"],
  ["/products/plywood/mdf", "/products/plywood-boards/mdf-board"],
  ["/products/plywood/laminate", "/products/laminates/decorative-laminates"],
];

const categoryMoves: [from: string, to: string][] = [
  ["plywood", "/products/plywood-boards"],
  ["hardware", "/products/furniture-hardware"],
  ["tools", "/products/painting-tools"],
  ["adhesives", "/products/adhesives-chemicals"],
  ["plumbing", "/products"],
  ["electrical", "/products"],
];

export const LEGACY_REDIRECTS = [
  ...typeMoves.map(([source, destination]) => ({ source, destination, permanent: true })),
  ...categoryMoves.map(([id, destination]) => ({ source: `/products/${id}/:type*`, destination, permanent: true })),
];
