const mediaScheme = matchMedia('(prefers-color-scheme: dark)')
const html = document.querySelector('html')
const update = () => {
	html.setAttribute('data-bs-theme', mediaScheme.matches ? 'dark' : 'light')
}
update()

mediaScheme.addEventListener('change', update)
