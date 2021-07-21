import { browser } from '$app/env'
import type { SearchContents } from '$lib/types'
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
export const updateTrack = updateSource()
export const ctxKey = {}
export const currentTitle = writable('')

type SearchStore = {
	subscribe: Writable<SearchContents>['subscribe']
	set: Writable<SearchContents>['set']
	update: Writable<SearchContents>['update']
}

export const search: SearchStore = writable()

export const isPagePlaying = writable('')
export const key = writable(undefined)

export const playerLoading = writable(false)
export const searchState = writable({
	option: '',
	text: ''
})

export const currentTrack = writable({
	continuation: '',
	id: '',
	videoId: '',
	title: '',
	artist: '',
	thumbnail: '',
	length: ''
})
export const theme = _theme()
export const filterAutoPlay = _filterAutoPlay()
export const currentMix = writable({
	videoId: '',
	playlistId: '',
	list: [
		{ id: '', videoId: '', thumbnail: '', artist: '', title: '', length: '' }
	]
})
export const iOS = _verifyUserAgent()
export function updateSource() {
	const { subscribe, set, update } = writable(undefined)
	return {
		subscribe,
		set,
		update,
		get: (src) => get(updateTrack),
		add: (src) => {
			src
		},
		reset: () => set(0)
	}
}

function _verifyUserAgent() {
	const { subscribe, set, update } = writable(undefined)
	let CheckiOS
	let isApple
	if (browser) {
		CheckiOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
		isApple = CheckiOS ? true : false
	}
	browser ? console.log(isApple, CheckiOS) : null

	return {
		subscribe,
		set,
		update,
		get: (user) => get(iOS),
		init: () => {
			set(isApple)
			browser ? localStorage.setItem('iOSClient', isApple) : null
		},
		reset: () => {
			set(undefined)
			browser ? localStorage.removeItem('iOSClient') : null
		}
	}
}

function _theme() {
	const { subscribe, set, update } = writable('')
	return {
		subscribe,
		update: (theme) => get(theme),
		get: (theme) => get(theme),
		set: (theme) => {
			set(theme)
			localStorage.setItem('theme', theme)
		},
		init: (theme) => {
			if (!localStorage.getItem('theme')) {
				set(theme)
				localStorage.setItem('theme', theme)
			} else {
				localStorage.getItem('theme')
				set(theme)
			}
			// if (localStorage.getItem('theme')) return;
		},
		reset: () => {
			set(undefined)
			browser ? localStorage.removeItem('theme') : null
		}
	}
}

function _filterAutoPlay() {
	const { subscribe, set, update } = writable(undefined)
	return {
		subscribe,
		update: (setting) => get(setting),
		get: (setting) => get(setting),
		set: (setting) => {
			set(setting)
			localStorage.setItem('filterAutoPlay', setting)
		},
		init: (setting) => {
			if (!localStorage.getItem('filterAutoPlay')) {
				set(setting)
				localStorage.setItem('filterAutoPlay', setting)
			} else {
				localStorage.getItem('filterAutoPlay')
				set(setting)
			}
			// if (localStorage.getItem('filterAutoPlay')) return;
		},
		reset: () => {
			set(undefined)
			browser ? localStorage.removeItem('filterAutoPlay') : null
		}
	}
}
