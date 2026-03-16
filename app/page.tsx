import { getRecommendations, getAllTags } from "@/lib/data";
import HomeClient from "./components/HomeClient";

export default async function Home() {
	const [items, tags] = await Promise.all([
		getRecommendations(),
		getAllTags(),
	]);

	return <HomeClient items={items} tags={tags} />;
}
