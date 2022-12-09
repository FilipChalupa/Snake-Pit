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

const field = document.querySelector('#field')
field.src = `/room/?id=${id}`

const playerToken = 'anonymous'

const loop = async () => {
	const payload = {
		playerToken,
		action: 'forward',
	}
	const response = await fetch(`/room/${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	})
	const data = await response.json()
	console.log(data)
	// @TODO: remove delay
	await new Promise((resolve) => setTimeout(resolve, 1000))
	await loop()
}
loop()
