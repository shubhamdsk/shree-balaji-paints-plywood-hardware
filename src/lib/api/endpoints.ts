export const API_ENDPOINTS = {
  products: "/api/products",
  product: (id: string) => `/api/products/${encodeURIComponent(id)}`,
  categories: "/api/categories",
  categoryGroups: "/api/categories/groups",
  brands: "/api/brands",
  photo: (key: string) => `/api/photos/${encodeURIComponent(key)}`,
} as const;
