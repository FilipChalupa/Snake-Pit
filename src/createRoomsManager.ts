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
			assureSomeRoomsAreWaiting()
		}
		const onRoomStatusChanged = () => {
			assureSomeRoomsAreWaiting()
		}
		const room = createStandaloneRoom(
			onRoomAbandoned,
			onRoomStatusChanged,
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
			if (a.getStatus() === b.getStatus()) {
				return 0
			}
			if (a.getStatus() === 'waiting') {
				return -1
			}
			if (b.getStatus() === 'waiting') {
				return 1
			}
			if (a.getStatus() === 'playing') {
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

	const assureSomeRoomsAreWaiting = () => {
		const waitingRooms = rooms.filter(
			(otherRoom) => otherRoom.getStatus() === 'waiting',
		)
		const isSomeSinglePlayerRoomWaiting = waitingRooms.some(
			(otherRoom) => otherRoom.maximumPlayers === 1,
		)
		if (!isSomeSinglePlayerRoomWaiting) {
			createRoom(10, 10, 1, 1)
		} else if (waitingRooms.length === 0) {
			createRoom(32, 18, 1 + Math.floor(Math.random() * 4), 10)
		}
	}

	return {
		createRoom,
		getRooms,
		findRoom,
	}
}
