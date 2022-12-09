import { generateId } from './generateId'

export const createRoom = () => {
	const id = generateId()
	const width = 10
	const height = 10
	const maximumPlayers = 4
	const state: 'waitingForOtherPlayers' | 'playing' = 'waitingForOtherPlayers'

	return {
		id,
		width,
		height,
		maximumPlayers,
		state,
	}
}

export type Room = ReturnType<typeof createRoom>
