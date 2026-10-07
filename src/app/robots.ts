import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", API_ENDPOINTS.photo("")], disallow: ["/api/", ROUTES.admin] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
