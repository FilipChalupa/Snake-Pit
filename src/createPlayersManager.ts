import { createPlayer as createStandalonePlayer, Player } from './createPlayer'

export const createPlayersManager = () => {
	const players: Player[] = []

	const createPlayer = (token: string, name = '') => {
		const player = createStandalonePlayer(token, name)
		players.push(player)
		return player
	}
	const findPlayerById = (id: string) =>
		players.find((player) => player.id === id) ?? null
	const findPlayerByToken = (token: string) =>
		players.find((player) => player.checkToken(token)) ?? null
	const getPlayers = () => players

	return {
		createPlayer,
		findPlayerById,
		findPlayerByToken,
		getPlayers,
	}
}
