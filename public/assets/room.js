const id = new URLSearchParams(location.search).get('id')
if (!id) {
	location.href = '/'
}
const field = document.querySelector('#field')

let isFirstRequest = true
const loop = async () => {
	const url = new URL(`${location.origin}/room/${id}`)
	if (isFirstRequest) {
		isFirstRequest = false
		url.searchParams.set('immediate', '')
	}
	const response = await fetch(url)
	const data = await response.json()
	console.log(data)
	// @TODO: remove delay
	await new Promise((resolve) => setTimeout(resolve, 1000))
	await loop()
}
loop()
