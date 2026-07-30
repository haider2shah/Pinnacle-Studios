const baseUrl = "https://pinnaclestudios.co";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/menu",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
