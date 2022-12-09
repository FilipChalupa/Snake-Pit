import cors from 'cors'
import express from 'express'
import { createRoom, Room } from './createRoom'

const app = express()
app.use(cors())
app.use(express.json())

const rooms: Room[] = []

// @TODO: remove
rooms.push(createRoom())

app.get('/list-rooms', (request, response) => {
	response.json({
		rooms: rooms.map((room) => ({
			id: room.id,
			maximumPlayers: room.maximumPlayers,
			width: room.width,
			height: room.height,
			state: room.state,
		})),
	})
})
app.post('/create-room', (request, response) => {
	response.json({})
})
app.get('/room/:id', (request, response) => {
	response.json({})
})
app.post('/room/:id', (request, response) => {
	const room = rooms.find((room) => room.id === request.params.id)
	console.log(request.body)
	response.json({
		id: room.id,
		maximumPlayers: room.maximumPlayers,
		width: room.width,
		height: room.height,
		state: room.state,
	})
})

app.use(express.static('public'))

app.listen(3000)
console.log('Server is running on port 3000')
