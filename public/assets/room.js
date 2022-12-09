const id = new URLSearchParams(location.search).get('id')
if (!id) {
	location.href = '/'
}
const board = document.querySelector('#board')
if (!(board instanceof HTMLCanvasElement)) {
	throw new Error('Board not convas element.')
}
const context = board.getContext('2d')
if (!context) {
	throw new Error('Context construction failed.')
}
const fieldSize = 20
const gapSize = 2

let isFirstRequest = true
const loop = async () => {
	const url = new URL(`${location.origin}/room/${id}`)
	if (isFirstRequest) {
		isFirstRequest = false
		url.searchParams.set('immediate', '')
	}
	const response = await fetch(url)
	const {
		room: { width, height, players },
	} = await response.json()
	board.width = width * fieldSize
	board.height = height * fieldSize
	players.forEach(({ fromHeadPosition }) => {
		fromHeadPosition.forEach(({ x, y }) => {
			context.fillStyle = 'red'
			context.fillRect(
				x * fieldSize + gapSize / 2,
				y * fieldSize + gapSize / 2,
				fieldSize - gapSize,
				fieldSize - gapSize,
			)
		})
	})

	// @TODO: remove delay
	await new Promise((resolve) => setTimeout(resolve, 1000))
	await loop()
}
loop()
