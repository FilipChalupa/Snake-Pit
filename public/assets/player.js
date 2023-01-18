import { colorToSymbol } from './colorToSymbol.js'
import { escape } from './escape.js'
import { renderBoard } from './renderBoard.js'

const run = async () => {
	const response = await fetch(`/player/${playerId}`)
	const { player } = await response.json()
	if (!player?.id) {
		location.href = '/'
	}

	const playerName = document.querySelector('#playerName')
	playerName.innerHTML = `${colorToSymbol(player.color)} ${escape(
		player.name || player.id,
	)}`
	const playerRating = document.querySelector('#playerRating')
	playerRating.textContent = player.rating

	let roomId = null
	let stopRenderingBoard = () => {}
	const loop = async () => {
		const response = await fetch('/list-rooms')
		const { rooms } = await response.json()
		const newRoom = (() => {
			const roomsWithPlayer = rooms.filter((room) =>
				room.joinedPlayers.some((otherPlayer) => otherPlayer.id === playerId),
			)
			const playingRoom =
				roomsWithPlayer.find((room) => room.status === 'playing') ?? null
			if (playingRoom) {
				return playingRoom
			}
			const waitingRoom =
				roomsWithPlayer.find((room) => room.status === 'waiting') ?? null
			return waitingRoom
		})()

		if (newRoom && newRoom.id !== roomId) {
			stopRenderingBoard()
			roomId = newRoom.id
			stopRenderingBoard = renderBoard(roomId)
		}

		setTimeout(loop, 1000)
	}
	loop()
}

const playerId = new URLSearchParams(location.search).get('id')
if (playerId) {
	run()
} else {
	location.href = '/'
}
