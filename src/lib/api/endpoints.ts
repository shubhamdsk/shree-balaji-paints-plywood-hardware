export const API_ENDPOINTS = {
  products: "/api/products",
  product: (id: string) => `/api/products/${encodeURIComponent(id)}`,
  categories: "/api/categories",
  categoryGroups: "/api/categories/groups",
  brands: "/api/brands",
} as const;
