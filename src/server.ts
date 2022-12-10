import cors from 'cors'
import express from 'express'
import { createPlayer, Player } from './createPlayer'
import { createRoom, Room } from './createRoom'
import { generateToken } from './utilities/generateToken'

const port = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(express.json())

const rooms: Room[] = []
const players: Player[] = []

players.push(createPlayer('anonymous', 'Anonymous'))
// @TODO: remove
rooms.push(createRoom())

app.get('/list-rooms', (request, response) => {
	response.json({
		rooms: rooms.map((room) => ({
			id: room.id,
			joinedPlayers: room.getPlayers().length,
			maximumPlayers: room.maximumPlayers,
			width: room.width,
			height: room.height,
			state: room.getState(),
		})),
	})
})
app.post('/create-room', (request, response) => {
	response.status(400).json({
		error: 'Not implemented.',
	})
})
const getPlayerInformation = (player: Player) => ({
	id: player.id,
	color: player.color,
})
app.post('/create-player', (request, response) => {
	const name = (() => {
		const name = request.body.name
		if (typeof name === 'string') {
			return name
		}
		return ''
	})()
	const playerToken = generateToken()
	const player = createPlayer(playerToken, name)
	players.push(player)
	response.json({
		player: getPlayerInformation(player),
		playerToken,
	})
})
app.post('/me', (request, response) => {
	const player = players.find((player) =>
		player.checkToken(request.body.playerToken),
	)
	if (!player) {
		response.status(400).json({
			error: 'Player not found.',
		})
		return
	}
	response.json({
		player: getPlayerInformation(player),
	})
})
const getRoomState = (room: Room) => {
	const players = room.getPlayers().map((player) => ({
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
		state: room.getState(),
		timeInTicks: room.getTimeInTicks(),
		players,
		food: room.getFood(),
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
	response.json({ room: getRoomState(room), yourPlayerId: player.id })
})

app.use(express.static('public'))

app.listen(port)
console.log(`Server is running at http://localhost:${port}`)
