import { renderBoard } from './renderBoard.js'

const id = new URLSearchParams(location.search).get('id')
if (id) {
	renderBoard(id)
} else {
	location.href = '/'
}
