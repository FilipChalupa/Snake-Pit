import { renderBoard } from './renderBoard.js'

const storageTokenKey = 'token'
const playerToken = await (async () => {
	const tokenFromStorage = localStorage.getItem(storageTokenKey)
	if (tokenFromStorage !== null) {
		const response = await fetch('/me', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				playerToken: tokenFromStorage,
			}),
		})
		const data = await response.json()
		if (data?.player?.id) {
			return tokenFromStorage
		}
	}
	const response = await fetch('/create-player', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name: 'Testing bot',
		}),
	})
	const { playerToken } = await response.json()
	localStorage.setItem(storageTokenKey, playerToken)
	return playerToken
})()

const id = await (async () => {
	const idFromUrl = new URLSearchParams(location.search).get('id')
	if (idFromUrl) {
		return idFromUrl
	}
	const response = await fetch('/list-rooms')
	const data = await response.json()
	const room = data.rooms.find(
		(room) =>
			room.state === 'waiting' &&
			room.maximumPlayers - room.joinedPlayers === 1,
	)
	if (room) {
		return room.id
	}
})()
if (!id) {
	alert('No room found')
	location.href = '/'
}

renderBoard(id)

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
