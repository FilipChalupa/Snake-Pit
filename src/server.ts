import cors from 'cors'
import express from 'express'
import { createPlayer, Player } from './createPlayer'
import { createRoom, Room } from './createRoom'

const port = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(express.json())

const rooms: Room[] = []
const players: Player[] = []

players.push(createPlayer('anonymous'))
// @TODO: remove
rooms.push(createRoom())

app.get('/list-rooms', (request, response) => {
	response.json({
		rooms: rooms.map((room) => ({
			id: room.id,
			connectedPlayers: room.players.length,
			maximumPlayers: room.maximumPlayers,
			width: room.width,
			height: room.height,
			state: room.state,
		})),
	})
})
app.post('/create-room', (request, response) => {
	response.status(400).json({
		error: 'Not implemented.',
	})
})
const getRoomState = (room: Room) => {
	const players = room.players.map((player) => ({
		id: player.player.id,
		isAlive: player.isAlive,
		color: player.player.color,
		fromHeadPosition: player.fromHeadPosition,
	}))
	return {
		id: room.id,
		maximumPlayers: room.maximumPlayers,
		width: room.width,
		height: room.height,
		state: room.state,
		timeInTicks: room.getTimeInTicks(),
		players,
	} as const
}

app.get('/room/:id', async (request, response) => {
	const room = rooms.find((room) => room.id === request.params.id)
	if (!room) {
		response.status(400).json({
			error: 'Room not found.',
		})
		return
	}
	const immediate = request.query.immediate !== undefined
	if (!immediate) {
		await room.observeNextTick()
	}
	response.json({
		room: getRoomState(room),
	})
})
app.post('/room/:id', async (request, response) => {
	const room = rooms.find((room) => room.id === request.params.id)
	if (!room) {
		response.status(400).json({
			error: 'Room not found.',
		})
		return
	}
	const player = players.find((player) =>
		player.checkToken(request.body.playerToken),
	)
	if (!player) {
		response.status(400).json({
			error: 'Player not found.',
		})
		return
	}
	await room.performAction(player, request.body.action)
	response.json({ room: getRoomState(room) })
})

app.use(express.static('public'))

app.listen(port)
console.log(`Server is running at http://localhost:${port}`)
