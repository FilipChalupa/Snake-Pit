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
		;[1, 2, 3, 4].forEach((maximumPlayers) => {
			const isRoomWaiting = waitingRooms.some(
				(otherRoom) => otherRoom.maximumPlayers === maximumPlayers,
			)
			if (!isRoomWaiting) {
				const width = Math.ceil(Math.random() * 10 + 10)
				const height = Math.ceil(Math.random() * 10 + 10)
				const maximumFood = Math.ceil(Math.random() * 10 + 1)
				createRoom(width, height, maximumPlayers, maximumFood)
			}
		})
	}

	return {
		createRoom,
		getRooms,
		findRoom,
	}
}
