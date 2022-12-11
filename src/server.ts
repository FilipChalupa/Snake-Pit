import cors from 'cors'
import express from 'express'
import { Player } from './createPlayer'
import { createPlayersManager } from './createPlayersManager'
import { Room } from './createRoom'
import { createRoomsManager } from './createRoomsManager'
import { generateToken } from './utilities/generateToken'

const port = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(express.json())

const roomsManager = createRoomsManager()
const playersManager = createPlayersManager()

app.get('/list-rooms', (request, response) => {
	response.json({
		rooms: roomsManager.getRooms().map((room) => ({
			id: room.id,
			joinedPlayers: room
				.getPlayers()
				.map(({ player }) => getPlayerInformation(player)),
			maximumPlayers: room.maximumPlayers,
			maximumFood: room.maximumFood,
			width: room.width,
			height: room.height,
			status: room.getStatus(),
		})),
	})
})

app.get('/list-players', (request, response) => {
	response.json({
		rooms: playersManager.getPlayers().map((player) => ({
			id: player.id,
			name: player.name,
			color: player.color,
		})),
	})
})
app.post('/create-room', (request, response) => {
	const readNumber = (key: string, min: number, max: number) => {
		if (typeof request.body[key] === 'number') {
			return Math.min(max, Math.max(min, request.body[key]))
		}
		return min + Math.floor(Math.random() * (max - min))
	}
	const width = readNumber('width', 5, 100)
	const height = readNumber('height', 5, 100)
	const maximumPlayers = readNumber('maximumPlayers', 1, 10)
	const maximumFood = readNumber('maximumFood', 1, 100)
	const room = roomsManager.createRoom(
		width,
		height,
		maximumPlayers,
		maximumFood,
	)
	response.json({ room: getRoomStatus(room) })
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
	const player = playersManager.createPlayer(playerToken, name)
	response.json({
		player: getPlayerInformation(player),
		playerToken,
	})
})
app.post('/me', (request, response) => {
	const player = playersManager.findPlayerByToken(request.body.playerToken)
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
app.get('/player/:id', (request, response) => {
	const player = playersManager.findPlayerById(request.params.id)
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
const getRoomStatus = (room: Room) => {
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
		status: room.getStatus(),
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
		room: getRoomStatus(room),
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
	const player = playersManager.findPlayerByToken(request.body.playerToken)
	if (!player) {
		response.status(400).json({
			error: 'Player not found.',
		})
		return
	}
	await room.performAction(player, request.body.action)
	response.json({ room: getRoomStatus(room), yourPlayerId: player.id })
})

app.use(express.static('public'))

app.listen(port)
console.log(`Server is running at http://localhost:${port}`)
