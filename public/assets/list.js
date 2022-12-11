import { colorToSymbol } from './colorToSymbol.js'

const roomList = document.querySelector('#roomList')
const playerList = document.querySelector('#playerList')

const escape = (htmlString) =>
	htmlString
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')

const refreshRooms = async () => {
	const response = await fetch('/list-rooms')
	const data = await response.json()
	roomList.innerHTML = data.rooms
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
										.map(
											(player) =>
												`${colorToSymbol(player.color)} ${escape(
													player.name || player.id,
												)}`,
										)
										.join(', ')
						}</dd>
						<dt>Maximum players</dt>
						<dd>${room.maximumPlayers}</dd>
						<dt>Maximum Food</dt>
						<dd>${room.maximumFood}</dd>
						<dt>Room size</dt>
						<dd>${room.width}×${room.height}</dd>
					</dl>
				</li>
			`,
		)
		.join('')
}

const refreshPlayers = async () => {
	const response = await fetch('/list-players')
	const data = await response.json()
	playerList.innerHTML = data.rooms
		.map(
			(player) => /* html */ `
				<li>
					<h3><a href="/player/?id=${player.id}">${colorToSymbol(player.color)} ${
				escape(player.name) || id
			}</a></h3>
					<dl>
						<dt>Rating</dt>
						<dd>@TODO</dd>
					</dl>
				</li>
			`,
		)
		.join('')
}

const refresh = async () => {
	await refreshRooms()
	await refreshPlayers()
}

const loop = async () => {
	await refresh()
	setTimeout(loop, 2000)
}
loop()
