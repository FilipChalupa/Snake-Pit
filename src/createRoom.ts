import { createArtificialDelay } from './createArtificialDelay'
import { Player } from './createPlayer'
import { assertNever } from './utilities/assertNever'
import { generateId } from './utilities/generateId'

const allowedActions = ['forward', 'turnLeft', 'turnRight'] as const
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
type Food = {
	position: Position
}
type Status = 'waiting' | 'playing' | 'ended'

const maximumTimeToAction = 1000
const maximumIdleTime = 60000
const artificialDelayTime = 200

export const createRoom = (
	onRoomAbandoned = () => {},
	onRoomStatusChanged = () => {},
	width = 32,
	height = 18,
	maximumPlayers = 2,
	maximumFood = 10,
) => {
	const id = generateId()
	let status: Status = 'waiting'
	const players: PlayingPlayer[] = []
	let food: Food[] = []
	let pendingNextTickObservations: PendingObservation[] = []
	let timeInTicks = 0
	let timeoutPerform: ReturnType<typeof setTimeout>
	let timeoutIdle: ReturnType<typeof setTimeout>
	const artificialActionsDelay = createArtificialDelay(() => {
		performActionsIfPossible()
	})

	const getObjectAtPosition = (
		position: Position,
		player?: PlayingPlayer,
	):
		| { type: 'empty' }
		| {
				type: 'food'
				index: number
		  }
		| { type: 'otherBody' }
		| { type: 'ownBody' }
		| { type: 'ownHead' }
		| { type: 'wall' } => {
		const isOutside =
			position.x < 0 ||
			position.x >= width ||
			position.y < 0 ||
			position.y >= height
		if (isOutside) {
			return { type: 'wall' }
		}
		const foodIndexAtHeadPosition = food.findIndex(
			(food) =>
				food.position.x === position.x && food.position.y === position.y,
		)
		if (foodIndexAtHeadPosition >= 0) {
			return { type: 'food', index: foodIndexAtHeadPosition }
		}
		if (player) {
			const isOwnHead =
				player.fromHeadPosition[0].x === position.x &&
				player.fromHeadPosition[0].y === position.y
			if (isOwnHead) {
				return { type: 'ownHead' }
			}
			const isOwnBody = player.fromHeadPosition.some(
				(playerPosition) =>
					playerPosition.x === position.x && playerPosition.y === position.y,
			)
			if (isOwnBody) {
				return { type: 'ownBody' }
			}
		}
		const isOtherBody = players.some((otherPlayer) =>
			otherPlayer.fromHeadPosition.some(
				(playerPosition) =>
					otherPlayer.player.id !== player?.player.id &&
					playerPosition.x === position.x &&
					playerPosition.y === position.y,
			),
		)
		if (isOtherBody) {
			return { type: 'otherBody' }
		}

		return { type: 'empty' }
	}

	const changeStatus = (newStatus: Status) => {
		if (status === newStatus) {
			return
		}
		status = newStatus
		if (status === 'ended') {
			updateRating()
		}
		onRoomStatusChanged()
	}

	const updateRating = () => {
		const pendingUpdates: Array<() => void> = []
		players.forEach((player) => {
			player.player.increaseRoomsPlayedByOne()
			players.forEach((otherPlayer) => {
				if (player.player.id === otherPlayer.player.id) {
					return
				}
				// Based on https://metinmediamath.wordpress.com/2013/11/27/how-to-calculate-the-elo-rating-including-example/
				const score = player.fromHeadPosition.length
				const otherScore = otherPlayer.fromHeadPosition.length
				const c = 400
				const playerR = Math.pow(10, player.player.getRating() / c)
				const otherPlayerR = Math.pow(10, otherPlayer.player.getRating() / c)
				const playerE = playerR / (playerR + otherPlayerR)
				const playerS = score > otherScore ? 1 : score === otherScore ? 0.5 : 0
				const k = 32
				const playerRatingAdjustment = Math.round(k * (playerS - playerE))

				pendingUpdates.push(() => {
					player.player.adjustRating(playerRatingAdjustment)
				})
			})
		})
		pendingUpdates.forEach((update) => update())
	}

	const restartMaximumIdleTimeCheck = () => {
		clearTimeout(timeoutIdle)
		timeoutIdle = setTimeout(() => {
			onRoomAbandoned()
		}, maximumIdleTime)
	}

	const placeFood = () => {
		if (food.length === maximumFood) {
			return
		}

		// Try to find empty position
		for (let i = 0; i < 100; i++) {
			const position = {
				x: Math.floor(Math.random() * width),
				y: Math.floor(Math.random() * height),
			}
			if (getObjectAtPosition(position).type === 'empty') {
				food.push({
					position,
				})
				break
			}
		}
	}

	const checkAllReady = () => {
		if (status !== 'waiting') {
			return
		}
		if (players.length === maximumPlayers) {
			changeStatus('playing')
		}
	}

	const checkAllDied = () => {
		if (status !== 'playing') {
			return
		}
		const allDead = players.every((player) => !player.isAlive)
		if (allDead) {
			changeStatus('ended')
		}
	}

	const performActions = () => {
		clearTimeout(timeoutPerform)
		timeInTicks++
		if (status === 'playing') {
			const foodIndexesToBeEaten: number[] = []
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
							: actionName === 'turnLeft'
							? {
									x: headPosition.x + lastDirection.y,
									y: headPosition.y - lastDirection.x,
							  }
							: actionName === 'turnRight'
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
					const headPosition = player.fromHeadPosition[0]
					const objectAtHead = getObjectAtPosition(headPosition, player)

					if (
						objectAtHead.type === 'wall' ||
						objectAtHead.type === 'otherBody' ||
						objectAtHead.type === 'ownBody'
					) {
						player.isAlive = false
						player.fromHeadPosition.shift()
						// @TODO: find out why head is not reverted to previous position
					} else if (objectAtHead.type === 'food') {
						foodIndexesToBeEaten.push(objectAtHead.index)
					} else {
						player.fromHeadPosition.pop()
					}
				}
			})
			food = food.filter((_, i) => !foodIndexesToBeEaten.includes(i))
		}
		placeFood()
		checkAllDied()
		players.forEach((player) => {
			player.pendingAction?.onTick()
			player.pendingAction = null
		})
		pendingNextTickObservations.forEach((pendingObservation) => {
			pendingObservation.onTick()
		})
		pendingNextTickObservations = []
		timeoutPerform = setTimeout(performActions, maximumTimeToAction)
		artificialActionsDelay.startDelay(artificialDelayTime)
	}

	const getTimeInTicks = () => timeInTicks

	const observeNextTick = async () => {
		restartMaximumIdleTimeCheck()
		await new Promise((resolve) => {
			pendingNextTickObservations.push({
				onTick: () => {
					resolve(undefined)
				},
			})
		})
	}

	const performAction = async (player: Player, action: string) => {
		restartMaximumIdleTimeCheck()
		const playerWithAction = (() => {
			const playerWithAction = players.find((p) => p.player.id === player.id)
			if (playerWithAction) {
				return playerWithAction
			}
			if (players.length <= maximumPlayers) {
				const yStart = 1 + players.length * 3
				const playerWithAction: PlayingPlayer = {
					isAlive: true,
					fromHeadPosition: [
						{ x: 3, y: yStart },
						{ x: 2, y: yStart },
						{ x: 1, y: yStart },
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
		checkAllReady()
		if (!allowedActions.includes(action as ActionName)) {
			// @TODO: send client error message
			// throw new Error('Invalid action.')
			action = 'forward'
		}
		const allowedAction = action as ActionName
		//playerWithAction.pendingAction = allowedAction
		return new Promise((resolve, reject) => {
			if (playerWithAction.pendingAction !== null) {
				//reject(new Error('Already performing an action.'))
				//playerWithAction.pendingAction.onRejected()
				// @TODO: so far the line above crashes the server
			}
			playerWithAction.pendingAction = {
				name: allowedAction,
				onTick: () => {
					resolve(undefined)
				},
				onRejected: () => {
					reject(new Error('Pending action was overriden.'))
				},
			}
			performActionsIfPossible()
		})
	}

	const performActionsIfPossible = () => {
		if (
			players.every(
				(player) => player.pendingAction !== null || player.isAlive === false,
			) &&
			artificialActionsDelay.isDelaying() === false
		) {
			performActions()
		}
	}

	return {
		id,
		width,
		height,
		maximumPlayers,
		maximumFood,
		getStatus: () => status,
		getPlayers: () => players,
		performAction,
		getTimeInTicks,
		observeNextTick,
		getFood: () => food,
	} as const
}

export type Room = ReturnType<typeof createRoom>
