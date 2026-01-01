import { registerScene } from '../core/ScrollEngine.js'

export default function identityScene() {
    const el = document.querySelector('#identity')
    const shape = el.querySelector('#shape')
    const text = el.querySelector('.identity-text')

    const tl = anime.timeline({
        autoplay: false,
        easing: 'easeInOutQuad'
    })

    tl
        // Blob → Diamond
        .add({
            targets: shape,
            d: [
                {
                    value: 'M100 20 L180 100 L100 180 L20 100 Z'
                }
            ],
            duration: 1000
        })
        // Diamond → Square-ish
        .add({
            targets: shape,
            d: [
                {
                    value: 'M40 40 L160 40 L160 160 L40 160 Z'
                }
            ],
            duration: 1000
        })
        // Text
        .add({
            targets: text,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600
        }, '-=400')

    registerScene({ el, timeline: tl })
}
