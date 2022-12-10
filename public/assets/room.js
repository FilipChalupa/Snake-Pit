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

if (window !== window.parent) {
	document.querySelectorAll('body > *').forEach((element) => {
		if (element !== board) {
			element.remove()
		}
	})
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
		room: { width, height, players, food },
	} = await response.json()
	board.width = width * fieldSize
	board.height = height * fieldSize
	food.forEach(({ position: { x, y } }) => {
		context.beginPath()
		context.arc(
			(x + 0.5) * fieldSize,
			(y + 0.5) * fieldSize,
			fieldSize / 2 - gapSize / 2,
			0,
			2 * Math.PI,
		)
		context.fillStyle = 'red'
		context.fill()
	})
	players.forEach(({ isAlive, color, fromHeadPosition }) => {
		fromHeadPosition.forEach(({ x, y }) => {
			context.fillStyle = isAlive ? `rgb(${color.join(',')})` : 'gray'
			context.fillRect(
				x * fieldSize + gapSize / 2,
				y * fieldSize + gapSize / 2,
				fieldSize - gapSize,
				fieldSize - gapSize,
			)
		})
	})

	await loop()
}
loop()
