import { colorToSymbol } from './colorToSymbol.js'
import { escape } from './escape.js'

const roomList = document.querySelector('#roomList')
const playerList = document.querySelector('#playerList')

const refreshRooms = async () => {
	const response = await fetch('/list-rooms')
	const data = await response.json()
	roomList.innerHTML = data.rooms
		.map(
			(room) => /* html */ `
				<div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
					<div class="card mb-4">
						<div class="card-body">
							<h5 class="card-title">${room.id}</h5>
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
							<a href="/room/?id=${room.id}" class="btn btn-primary">Open</a>
							<a href="/demo-bot/?id=${room.id}" class="btn btn-link">Join as demo bot</a>
						</div>
					</div>
				</div>
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
