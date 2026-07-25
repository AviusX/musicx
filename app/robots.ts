import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: "/login",
		},
		sitemap: "https://music.aviusx.dev/sitemap.xml",
	};
}
