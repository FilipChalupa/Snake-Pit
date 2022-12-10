import { generateId } from './utilities/generateId'

// @TODO: improve color selection
const colors = [
	[142, 75, 153],
	[255, 246, 137],
	[207, 255, 176],
	[89, 152, 197],
] as const

export const createPlayer = (token: string, name = '') => {
	const id = generateId()
	const color = colors[Math.floor(Math.random() * colors.length)]

	const checkToken = (tokenToValidate: string) => tokenToValidate === token

	return {
		id,
		name,
		color,
		checkToken,
	}
}

export type Player = ReturnType<typeof createPlayer>
