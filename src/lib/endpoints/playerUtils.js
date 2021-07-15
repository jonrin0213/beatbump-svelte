const parseProxyRedir = (url) => {
	let new_url = url.replace('https://', '')
	new_url = new_url.split('/')
	new_url = new_url[2] !== undefined ? new_url[2] : new_url[1]
	url = 'https://redirector.googlevideo.com/' + new_url
	return url
}

export const sort = (data) => {
	try {
		const json = data
		const streamingData = json.streamingData
		const formatParent = streamingData['formats'].concat(
			streamingData['adaptiveFormats']
		)
		let arr = []

		formatParent.forEach((i) => {
			if (i.mimeType.includes('audio')) {
				if (
					i.audioChannels === 2 &&
					i.audioQuality.includes('AUDIO_QUALITY_MEDIUM')
				) {
					i.url = parseProxyRedir(i.url)
					return arr.push(i)
				}
			}
		})
		if (arr.length !== 0) {
			return arr.map((format) => {
				return {
					url: format.url
				}
			})
		}

		return null
	} catch (e) {
		console.log('Fetch error', e)

		return null
	}
}
