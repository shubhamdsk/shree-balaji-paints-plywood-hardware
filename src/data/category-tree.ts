import type { CategoryGroup } from "@/types";

export const categoryGroups: CategoryGroup[] = [
  {
    id: "paints",
    name: "Paints",
    subtypes: [
      "Interior",
      "Exterior",
      "Wood Coatings",
      "Metal Paints",
      "Enamel",
      "Primer",
      "Putty",
      "Waterproofing",
    ],
  },
  { id: "plywood", name: "Plywood", subtypes: ["Marine", "Commercial", "Block Board", "MDF", "Laminate"] },
  { id: "hardware", name: "Hardware", subtypes: ["Locks", "Hinges & Handles"] },
  { id: "plumbing", name: "Plumbing", subtypes: ["Plumbing"] },
  { id: "electrical", name: "Electrical", subtypes: ["Electrical"] },
  { id: "tools", name: "Tools", subtypes: ["Tools"] },
  { id: "adhesives", name: "Adhesives & Sealants", subtypes: ["Adhesives"] },
];
