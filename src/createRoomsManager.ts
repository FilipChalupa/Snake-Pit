import { createRoom as createStandaloneRoom, Room } from './createRoom'

export const createRoomsManager = () => {
	let rooms: Room[] = []
	const createRoom = () => {
		const room = createStandaloneRoom()
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

	return {
		createRoom,
		getRooms,
		findRoom,
	}
}
