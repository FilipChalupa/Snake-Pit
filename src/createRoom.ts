import { generateId } from './generateId'

export const createRoom = () => {
	const id = generateId()
	const width = 10
	const height = 10
	const maximumPlayers = 4

	return {
		id,
		width,
		height,
		maximumPlayers,
	}
}

export type Room = ReturnType<typeof createRoom>
