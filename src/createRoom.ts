import { Player } from './createPlayer'
import { generateId } from './generateId'

const allowedActions = ['forward', 'left', 'right'] as const
type ActionName = typeof allowedActions[number]
type PlayerWithAction = {
	pendingAction: {
		name: ActionName
		onTick: () => void
		onRejected: () => void
	} | null
	player: Player
}
type PendingObservation = {
	onTick: () => void
}

export const createRoom = () => {
	// @TODO: remove fixed id
	const id = generateId() && 'fixed-room-id'
	const width = 10
	const height = 10
	const maximumPlayers = 4
	const state: 'waitingForOtherPlayers' | 'playing' = 'waitingForOtherPlayers'
	const players: PlayerWithAction[] = []
	let pendingNextTickObservations: PendingObservation[] = []
	let timeInTicks = 0

	const performActions = () => {
		timeInTicks++
		console.log('performing all actions')
		players.forEach((player) => {
			player.pendingAction.onTick()
			player.pendingAction = null
		})
		pendingNextTickObservations.forEach((pendingObservation) => {
			pendingObservation.onTick()
		})
		pendingNextTickObservations = []
	}

	const getTimeInTicks = () => timeInTicks

	const observeNextTick = async () => {
		await new Promise((resolve) => {
			pendingNextTickObservations.push({
				onTick: () => {
					resolve(undefined)
				},
			})
		})
	}

	const performAction = async (player: Player, action: string) => {
		const playerWithAction = (() => {
			const playerWithAction = players.find((p) => p.player.id === player.id)
			if (playerWithAction) {
				return playerWithAction
			}
			if (players.length <= maximumPlayers) {
				const playerWithAction: PlayerWithAction = {
					pendingAction: null,
					player,
				}
				players.push(playerWithAction)
				return playerWithAction
			} else {
				// @TODO
				throw new Error('Room is full.')
			}
		})()
		if (!allowedActions.includes(action as ActionName)) {
			// @TODO
			throw new Error('Invalid action.')
		}
		const allowedAction = action as ActionName
		//playerWithAction.pendingAction = allowedAction
		return new Promise((resolve, reject) => {
			if (playerWithAction.pendingAction !== null) {
				//reject(new Error('Already performing an action.'))
				playerWithAction.pendingAction.onRejected()
			}
			playerWithAction.pendingAction = {
				name: allowedAction,
				onTick: () => {
					resolve(undefined)
				},
				onRejected: () => {
					reject(new Error('Pending action was ovverriden.'))
				},
			}
			if (true || players.every((player) => player.pendingAction !== null)) {
				performActions()
			}
		})
	}

	return {
		id,
		width,
		height,
		maximumPlayers,
		state,
		players,
		performAction,
		getTimeInTicks,
		observeNextTick,
	}
}

export type Room = ReturnType<typeof createRoom>
