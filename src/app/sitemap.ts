import type {
  MetadataRoute,
} from "next";

const SITE_URL =
  "https://mwc.everwinningaustralia.com.au";

export default function sitemap():
  MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/register`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/live`,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}
