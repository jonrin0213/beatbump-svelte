import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
export const load = async ({ url, params, fetch }: Parameters<PageLoad>[0]) => {
	const id = url.searchParams.get("id");
	const playlist = url.searchParams.get("list") || undefined;
	// const meta = await get('player', { videoId: id })
	// const data = await meta.body

	if (!id) {
		throw redirect(301, "/trending");
	}

	const [data, list] = await Promise.all([
		fetch(`/api/player.json?videoId=${id ? id : ""}${playlist ? `&playlistId=${playlist}` : ""}`).then((res) =>
			res.json(),
		),
		fetch(`/api/next.json?videoId=${id ? id : ""}${playlist ? `&playlistId=${playlist}` : ""}`).then((res) =>
			res.json(),
		),
	]);

	const { videoDetails: { title = "", videoId = "", thumbnail: { thumbnails = [] } = {} } = {} } = data;

	return {
		title,
		thumbnails,
		videoId,
		playlist,
		related: list,
		data,
	};
};
