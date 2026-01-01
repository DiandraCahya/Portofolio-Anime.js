import { splitText } from '../core/TextSplit.js'
import { registerScene } from '../core/ScrollEngine.js'

export default function introScene() {
    const el = document.querySelector('#intro')
    const title = el.querySelector('.split')
    const line = el.querySelector('line')

    splitText(title)

    const tl = anime.timeline({
        autoplay: false,
        easing: 'easeOutExpo'
    })

    tl.add({
        targets: '#intro h1 span',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(80)
    })
        .add({
            targets: '#intro .tagline',
            opacity: [0, 1],
            translateY: [20, 0]
        }, '-=400')
        .add({
            targets: line,
            strokeDashoffset: [300, 0],
            duration: 800
        }, '-=300')

    registerScene({ el, timeline: tl })
}
