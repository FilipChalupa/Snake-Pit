import { Player } from './createPlayer'
import { generateId } from './generateId'
import { assertNever } from './utilities/assertNever'

const allowedActions = ['forward', 'left', 'right'] as const
type ActionName = typeof allowedActions[number]
type Position = { x: number; y: number }
type PlayingPlayer = {
	pendingAction: {
		name: ActionName
		onTick: () => void
		onRejected: () => void
	} | null
	player: Player
	isAlive: boolean
	fromHeadPosition: Position[]
}
type PendingObservation = {
	onTick: () => void
}

export const createRoom = (width = 32, height = 18, maximumPlayers = 4) => {
	const id = generateId()
	const state: 'waitingForOtherPlayers' | 'playing' = 'waitingForOtherPlayers'
	const players: PlayingPlayer[] = []
	// @TODO: food
	let pendingNextTickObservations: PendingObservation[] = []
	let timeInTicks = 0

	const performActions = () => {
		timeInTicks++
		// @TODO: handle game state waitingForOtherPlayers
		players.forEach((player) => {
			if (player.isAlive) {
				const actionName = player.pendingAction?.name ?? 'forward'
				const headPosition = player.fromHeadPosition[0]
				const neckPosition = player.fromHeadPosition[1]
				const lastDirection = {
					x: headPosition.x - neckPosition.x,
					y: headPosition.y - neckPosition.y,
				}
				const nextPosition =
					actionName === 'forward'
						? {
								x: headPosition.x + lastDirection.x,
								y: headPosition.y + lastDirection.y,
						  }
						: actionName === 'left'
						? {
								x: headPosition.x + lastDirection.y,
								y: headPosition.y - lastDirection.x,
						  }
						: actionName === 'right'
						? {
								x: headPosition.x - lastDirection.y,
								y: headPosition.y + lastDirection.x,
						  }
						: assertNever(actionName)
				player.fromHeadPosition.unshift(nextPosition)
			}
		})
		players.forEach((player) => {
			if (player.isAlive) {
				// Check collision
				const headPosition = player.fromHeadPosition[0]
				const isOutside =
					headPosition.x < 0 ||
					headPosition.x >= width ||
					headPosition.y < 0 ||
					headPosition.y >= height
				const isCollidingWithABody = players.some((otherPlayer) =>
					otherPlayer.fromHeadPosition.some(
						(playerPosition, i) =>
							(otherPlayer.player.id !== player.player.id || i !== 0) &&
							playerPosition.x === headPosition.x &&
							playerPosition.y === headPosition.y,
					),
				)
				if (isOutside || isCollidingWithABody) {
					player.isAlive = false
					player.fromHeadPosition.shift()
				} else {
					player.fromHeadPosition.pop()
				}
			}
		})
		players.forEach((player) => {
			player.pendingAction?.onTick()
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
				const playerWithAction: PlayingPlayer = {
					isAlive: true,
					fromHeadPosition: [
						{ x: 2, y: 1 },
						{ x: 1, y: 1 },
					],
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
	} as const
}

export type Room = ReturnType<typeof createRoom>
