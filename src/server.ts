import cors from 'cors'
import express from 'express'
import { createPlayer, Player } from './createPlayer'
import { Room } from './createRoom'
import { createRoomsManager } from './createRoomsManager'
import { generateToken } from './utilities/generateToken'

const port = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(express.json())

const roomsManager = createRoomsManager()
const players: Player[] = []

// Player for testing purposes: maybe remove
players.push(createPlayer('anonymous', 'Anonymous'))

app.get('/list-rooms', (request, response) => {
	response.json({
		rooms: roomsManager.getRooms().map((room) => ({
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
	const room = roomsManager.createRoom(/*10, 10, 1*/)
	response.json({ room: getRoomState(room) })
})
const getPlayerInformation = (player: Player) => ({
	id: player.id,
	color: player.color,
	name: player.name,
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
		name: player.player.name,
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
	const room = roomsManager.findRoom(request.params.id)
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
	const room = roomsManager.findRoom(request.params.id)
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
