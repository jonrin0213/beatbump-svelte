import type { Artist, Thumbnail } from "$lib/types";
import { pb } from "$lib/utils";
import type { NextContinuationData, PlaylistItem } from "$lib/types";

/** Hits the YouTube Music API for a playlist page
 *	Currently is not fully implemented.
 *
 * @export get
 * @param {*} { query }
 * @return {*}  {Promise<PlaylistItem[]>}
 */
export async function get({ query }): Promise<PlaylistItem[]> {
	const browseId = query.get("list");
	// console.log(videoId,playlistId)
	try {
		const response = await fetch(
			"https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30",
			{
				method: "POST",
				body: JSON.stringify({
					context: {
						client: {
							clientName: "WEB_REMIX",
							clientVersion: "0.1",
						},

						user: {
							enableSafetyMode: false,
						},
					},
					browseId: `${browseId}`,
					browseEndpointContextMusicConfig: {
						pageType: "MUSIC_PAGE_TYPE_PLAYLIST",
					},
				}),
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					Origin: "https://music.youtube.com",
				},
			}
		);

		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { statusCode: response.status, body: response.statusText };
		}
		const {
			header: { musicDetailHeaderRenderer },
			contents,
		} = await response.json();
		const playlist = pb(
			contents,
			"singleColumnBrowseResultsRenderer:tabs:0:tabRenderer:content:sectionListRenderer:contents:0:musicPlaylistShelfRenderer",
			true
		);
		const playlistId = playlist.playlistId;
		const continuations: NextContinuationData = pb(
			playlist,
			"continuations:0:nextContinuationData",
			false
		);

		const objectMap = (obj, fn) =>
			Object.fromEntries(
				Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])
			);

		const parseHeader = Array(musicDetailHeaderRenderer).map((d) => {
			const description = pb(d, "description:runs:0:text", true);
			const subtitles: string = pb(d, "subtitle:runs:text", true);
			const thumbnails = pb(
				d,
				"thumbnail:croppedSquareThumbnailRenderer:thumbnail:thumbnails",
				false
			);
			const secondSubtitle: string = pb(d, "secondSubtitle:runs:text", true);
			const title = pb(d, "title:runs:0:text", true);

			return { description, subtitles, thumbnails, secondSubtitle, title };
		})[0];

		const parseTrack: Array<PlaylistItem> = playlist.contents.map(
			({ musicResponsiveListItemRenderer: ctx }) => {
				const length = pb(
					ctx,
					"fixedColumns:0:musicResponsiveListItemFixedColumnRenderer:text:runs:0:text",
					true
				);
				const flexColumns = pb(ctx, "flexColumns");

				const artistEndpoint = pb(
					flexColumns,
					"musicResponsiveListItemFlexColumnRenderer:1:text:runs:0",
					true
				);
				const titleBody = pb(
					flexColumns,
					"musicResponsiveListItemFlexColumnRenderer:0:text:runs:0",
					true
				);
				const {
					videoId,
					playlistId,
				} = titleBody.navigationEndpoint.watchEndpoint;
				const title = titleBody.text;

				const artist: Artist = {
					name: artistEndpoint.text,
					browseId: artistEndpoint.navigationEndpoint.browseEndpoint.browseId,
				};
				const thumbnails: Thumbnail = pb(
					ctx,
					"thumbnail:musicThumbnailRenderer:thumbnail:thumbnails",
					true
				);

				// console.log(length, flexColumns, artist);
				return { length, videoId, playlistId, thumbnails, title, artist };
			}
		);
		// if (Object.prototype.hasOwnProperty.call(playlist,"continuations") {

		// }

		// console.log(items)
		// parsePlaylistContents(contents);
		return {
			statusCode: 200,
			body: JSON.stringify({ parseTrack, parseHeader }),
		};
	} catch (error) {
		// output to netlify function log
		console.log(error);
		return {
			statusCode: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message }),
		};
	}
}
