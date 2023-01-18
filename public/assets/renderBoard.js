import { colorToSymbol } from './colorToSymbol.js'
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

		// Scale canvas
		const renderedWidth = board.getBoundingClientRect().width
		const optimalWidth = width * fieldSize // @TODO: handle display DPI (window.devicePixelRatio ?? 1)
		const scale = Math.max(1, renderedWidth / optimalWidth)
		board.width = width * fieldSize * scale
		board.height = height * fieldSize * scale
		context.scale(scale, scale)
		target.style.setProperty('--width', `${width}`)
		target.style.setProperty('--height', `${height}`)

		if (isFirstRequest) {
			isFirstRequest = false
			board.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			})
		}

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
			fromHeadPosition.forEach(({ x, y }, i) => {
				const positionCloserToHead = i > 0 ? fromHeadPosition[i - 1] : null
				context.fillStyle = isAlive ? `rgb(${color.join(',')})` : 'gray'
				context.strokeStyle = context.fillStyle
				if ('roundRect' in context && i === 0) {
					context.beginPath()
					context.roundRect(
						x * fieldSize + gapSize / 2,
						y * fieldSize + gapSize / 2,
						fieldSize - gapSize,
						fieldSize - gapSize,
						2 * gapSize,
					)
					context.fill()
				} else {
					context.fillRect(
						x * fieldSize + gapSize / 2,
						y * fieldSize + gapSize / 2,
						fieldSize - gapSize,
						fieldSize - gapSize,
					)
				}
				if (positionCloserToHead) {
					context.beginPath()
					context.moveTo((x + 0.5) * fieldSize, (y + 0.5) * fieldSize)
					context.lineTo(
						(positionCloserToHead.x + 0.5) * fieldSize,
						(positionCloserToHead.y + 0.5) * fieldSize,
					)
					context.lineWidth = fieldSize - gapSize
					context.stroke()
				}
			})
		})

		score.innerHTML = ''
		players
			.sort((a, b) => b.fromHeadPosition.length - a.fromHeadPosition.length)
			.forEach(({ name, color, id, fromHeadPosition }) => {
				const li = document.createElement('li')
				li.textContent = `${name || id}: ${fromHeadPosition.length}`
				li.innerHTML = `${colorToSymbol(color)} ${li.innerHTML}`
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
