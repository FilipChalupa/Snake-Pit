const id = new URLSearchParams(location.search).get('id')
if (!id) {
	location.href = '/'
}
const field = document.querySelector('#field')
