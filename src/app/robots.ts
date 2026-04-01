import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://likelihood.co.kr";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/checkout/", "/mypage/", "/orders/", "/settings/"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
