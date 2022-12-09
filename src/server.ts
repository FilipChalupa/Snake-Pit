import express from 'express'
import { createRoom, Room } from './createRoom'

const app = express()

const rooms: Room[] = []

// @TODO: remove
rooms.push(createRoom())

app.get('/list-rooms', (request, response) => {
	response.send({
		rooms: rooms.map((room) => ({
			id: room.id,
			maximumPlayers: room.maximumPlayers,
			width: room.width,
			height: room.height,
		})),
	})
})
app.post('/create-room', (request, response) => {
	response.send('Ok')
})
app.get('/room/:id', (request, response) => {
	response.send('Ok')
})
app.post('/room/:id', (request, response) => {
	response.send('Ok')
})

app.use(express.static('public'))

app.listen(3000)
console.log('Server is running on port 3000')
