import { createRoom as createStandaloneRoom, Room } from './createRoom'

export const createRoomsManager = () => {
	let rooms: Room[] = []
	const createRoom = (
		width?: number,
		height?: number,
		maximumPlayers?: number,
		maximumFood?: number,
	) => {
		const onRoomAbandoned = () => {
			rooms = rooms.filter((otherRoom) => otherRoom !== room)
		}
		const onRoomStateChanged = () => {
			const waitingRooms = rooms.filter(
				(otherRoom) => otherRoom.getState() === 'waiting',
			)
			const isSomeSinglePlayerRoomWaiting = waitingRooms.some(
				(otherRoom) => otherRoom.getPlayers().length === 1,
			)
			if (!isSomeSinglePlayerRoomWaiting) {
				createRoom(10, 10, 1, 1)
			} else if (waitingRooms.length === 0) {
				createRoom(32, 18, 1 + Math.floor(Math.random() * 4), 10)
			}
		}
		const room = createStandaloneRoom(
			onRoomAbandoned,
			onRoomStateChanged,
			width,
			height,
			maximumPlayers,
			maximumFood,
		)
		rooms.push(room)
		return room
	}
	const findRoom = (id: string) => rooms.find((room) => room.id === id) ?? null
	const getRooms = () =>
		rooms.sort((a, b) => {
			if (a.getState() === b.getState()) {
				return 0
			}
			if (a.getState() === 'waiting') {
				return -1
			}
			if (b.getState() === 'waiting') {
				return 1
			}
			if (a.getState() === 'playing') {
				return -1
			}
			return 1
		})

	const createInitialRooms = () => {
		for (let i = 0; i < 4; i++) {
			createRoom(32, 18, i + 1, Math.max(1, i * 10))
		}
	}
	createInitialRooms()

	return {
		createRoom,
		getRooms,
		findRoom,
	}
}
