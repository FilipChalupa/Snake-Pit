const list = document.querySelector('#list')

const refresh = async () => {
	const response = await fetch('/list-rooms')
	const data = await response.json()
	list.innerHTML = data.rooms
		.map(
			(room) => /* html */ `
				<li>
					<h3><a href="/room/?id=${room.id}">${room.id}</a></h3>
					<dl>
						<dt>State</dt>
						<dd>${room.state /* @TODO: translate */}</dd>
						<dt>Joined players</dt>
						<dd>${room.joinedPlayers}</dd>
						<dt>Maximum players</dt>
						<dd>${room.maximumPlayers}</dd>
						<dt>Room size</dt>
						<dd>${room.width}×${room.height}</dd>
					</dl>
				</li>
			`,
		)
		.join('')
}

const loop = async () => {
	await refresh()
	setTimeout(loop, 2000)
}
loop()
