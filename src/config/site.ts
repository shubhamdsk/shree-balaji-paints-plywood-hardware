const DEFAULT_SITE_URL = "https://shree-balaji-paints-plywood-hardware.netlify.app";

export const siteUrl = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

export function absoluteUrl(path: string) {
  return `${siteUrl}${path === "/" ? "" : path}`;
}
