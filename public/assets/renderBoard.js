const fieldSize = 20
const gapSize = 2

export const renderBoard = (roomId) => {
	const target = document.querySelector('#board')
	if (!(target instanceof HTMLElement)) {
		throw new Error('Board target is missing.')
	}
	target.innerHTML = ''

	const board = document.createElement('canvas')
	board.classList.add('board')
	const context = board.getContext('2d')
	if (!context) {
		throw new Error('Context construction failed.')
	}
	let isRunning = true
	const score = document.createElement('ol')

	let isFirstRequest = true
	const loop = async () => {
		const url = new URL(`${location.origin}/room/${roomId}`)
		if (isFirstRequest) {
			isFirstRequest = false
			url.searchParams.set('immediate', '')
			target.appendChild(board)
			target.appendChild(score)
		}
		const response = await fetch(url)
		const {
			room: { width, height, players, food },
		} = await response.json()
		if (!isRunning) {
			return
		}
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

		score.innerHTML = ''
		players
			.sort((a, b) => b.fromHeadPosition.length - a.fromHeadPosition.length)
			.forEach(({ name, id, fromHeadPosition }) => {
				const li = document.createElement('li')
				li.textContent = `${name || id}: ${fromHeadPosition.length}`
				score.appendChild(li)
			})

		await loop()
	}
	loop()

	const stop = () => {
		isRunning = false
	}

	return stop
}
