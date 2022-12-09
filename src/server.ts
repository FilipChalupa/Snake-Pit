import express from 'express'

const app = express()

app.get('/list-rooms', (request, response) => {
	response.send('Ok')
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
