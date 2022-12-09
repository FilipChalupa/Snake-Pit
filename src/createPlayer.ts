import { generateId } from './generateId'

// @TODO: improve color selection
const colors = [
	[142, 75, 153],
	[224, 54, 22],
	[255, 246, 137],
	[207, 255, 176],
	[89, 152, 197],
] as const

export const createPlayer = (token: string /* @TODO: readonly */) => {
	const id = generateId()
	const color = colors[Math.floor(Math.random() * colors.length)]

	const checkToken = (tokenToValidate: string) => tokenToValidate === token

	return {
		id,
		color,
		checkToken,
	}
}

export type Player = ReturnType<typeof createPlayer>
