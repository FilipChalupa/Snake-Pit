import { generateId } from './generateId'

export const createPlayer = (token: string /* @TODO: readonly */) => {
	const id = generateId()

	const checkToken = (tokenToValidate: string) => tokenToValidate === token

	return {
		id,
		checkToken,
	}
}

export type Player = ReturnType<typeof createPlayer>
