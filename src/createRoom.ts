import { Player } from './createPlayer'
import { generateId } from './generateId'

export const createRoom = () => {
	const id = generateId()
	const width = 10
	const height = 10
	const maximumPlayers = 4
	const state: 'waitingForOtherPlayers' | 'playing' = 'waitingForOtherPlayers'
	const players: Player[] = []

	return {
		id,
		width,
		height,
		maximumPlayers,
		state,
		players,
	}
}

export type Room = ReturnType<typeof createRoom>
