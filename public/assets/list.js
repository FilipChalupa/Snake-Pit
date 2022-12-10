const list = document.querySelector('#list')

const escape = (htmlString) =>
	htmlString
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')

const refresh = async () => {
	const response = await fetch('/list-rooms')
	const data = await response.json()
	list.innerHTML = data.rooms
		.map(
			(room) => /* html */ `
				<li>
					<h3><a href="/room/?id=${room.id}">${room.id}</a></h3>
					<small><a href="/demo-bot/?id=${room.id}">Join as demo bot</a></small>
					<dl>
						<dt>Status</dt>
						<dd>${room.status /* @TODO: translate */}</dd>
						<dt>Joined players</dt>
						<dd>${
							room.joinedPlayers.length === 0
								? '0'
								: room.joinedPlayers
										.map((player) => escape(player.name || player.id))
										.join(', ')
						}</dd>
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
