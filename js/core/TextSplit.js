export function splitText(el) {
    const text = el.innerText
    el.innerHTML = ''

    text.split('').forEach(char => {
        const span = document.createElement('span')
        span.innerText = char === ' ' ? '\u00A0' : char
        el.appendChild(span)
    })
}
