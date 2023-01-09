export const createArtificialDelay = (callback: () => void) => {
	let isDelaying = false
	let delayTimer: ReturnType<typeof setTimeout>

	const startDelay = (milliseconds: number) => {
		clearTimeout(delayTimer)
		isDelaying = true
		delayTimer = setTimeout(() => {
			isDelaying = false
			callback()
		}, milliseconds)
	}

	return { isDelaying: () => isDelaying, startDelay }
}
