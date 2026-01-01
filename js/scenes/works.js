import { registerScene } from '../core/ScrollEngine.js'

export default function worksScene() {
    const el = document.querySelector('#works')
    const track = el.querySelector('.horizontal-track')
    const cards = el.querySelectorAll('.work-card')

    const totalScroll =
        track.scrollWidth - window.innerWidth

    const tl = anime.timeline({
        autoplay: false,
        easing: 'easeOutQuad'
    })

    // horizontal movement
    tl.add({
        targets: track,
        translateX: [0, -totalScroll],
        duration: 2000
    })

    // card depth animation
    tl.add({
        targets: cards,
        scale: [0.95, 1],
        opacity: [0.6, 1],
        delay: anime.stagger(200),
        duration: 800
    }, 0)

    registerScene({ el, timeline: tl })
}
