const id = await (async () => {
	const idFromUrl = new URLSearchParams(location.search).get('id')
	if (idFromUrl) {
		return idFromUrl
	}
	const response = await fetch('/list-rooms')
	const data = await response.json()
	const room = data.rooms.find(
		(room) => room.state === 'waitingForOtherPlayers',
	)
	if (room) {
		return room.id
	}
})()
if (!id) {
	alert('No room found')
	location.href = '/'
}

const board = document.querySelector('#field')
board.src = `/room/?id=${id}`

const playerToken = 'anonymous'

const loop = async (action) => {
	const payload = {
		playerToken,
		action,
	}
	const response = await fetch(`/room/${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	})
	const {
		room: { width, height, players },
		yourPlayerId,
	} = await response.json()
	const player = players.find((otherPlayer) => otherPlayer.id === yourPlayerId)
	let nextAction = 'forward'
	if (player?.isAlive) {
		console.log('plan')
		const headPosition = player.fromHeadPosition[0]
		const neckPosition = player.fromHeadPosition[1]
		const direction = {
			x: headPosition.x - neckPosition.x,
			y: headPosition.y - neckPosition.y,
		}
		if (direction.x === 1 && headPosition.x === width - 1) {
			nextAction = headPosition.y < height / 2 ? 'right' : 'left'
		} else if (direction.x === -1 && headPosition.x === 0) {
			nextAction = headPosition.y < height / 2 ? 'left' : 'right'
		} else if (direction.y === 1 && headPosition.y === height - 1) {
			nextAction = headPosition.x < height / 2 ? 'left' : 'right'
		} else if (direction.y === -1 && headPosition.y === 0) {
			nextAction = headPosition.x < height / 2 ? 'right' : 'left'
		}
	}
	// @TODO: remove delay
	await new Promise((resolve) => setTimeout(resolve, 100))
	await loop(nextAction)
}
loop('forward')
