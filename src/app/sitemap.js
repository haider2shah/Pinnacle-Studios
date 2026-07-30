const baseUrl = "https://pinnaclestudios.co";

export const dynamic = "force-static";

export default function sitemap() {
  const routes = ["", "/about", "/services", "/contact"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
