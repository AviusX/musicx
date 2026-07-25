import AnimationProvider from "./components/AnimationProvider";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TagMarquee from "./components/TagMarquee";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";
import { getCatalog } from "@/lib/data";

// Fully static page; mutations call revalidatePath("/") to refresh it.
export const revalidate = 3600;

export default async function Home() {
	const { recommendations, tags } = await getCatalog();

	const itemListJsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Hrijul's music recommendations",
		numberOfItems: recommendations.length,
		itemListElement: recommendations.map((rec, i) => ({
			"@type": "ListItem",
			position: i + 1,
			item: {
				"@type": "MusicRecording",
				name: rec.title,
				byArtist: { "@type": "MusicGroup", name: rec.artist },
				url: rec.url,
			},
		})),
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
			/>
			<AnimationProvider />
			<Nav />
			<main>
				<Hero trackCount={recommendations.length} />
				<TagMarquee tagNames={tags.map((t) => t.name)} />
				<Catalog recommendations={recommendations} tags={tags} />
			</main>
			<Footer />
		</>
	);
}
