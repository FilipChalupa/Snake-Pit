import crypto from 'crypto'

export const generateToken = () => {
	const bytes = crypto.randomBytes(16)
	return bytes.toString('base64')
}
