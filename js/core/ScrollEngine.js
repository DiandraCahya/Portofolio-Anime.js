const scenes = []

export function registerScene({ el, timeline }) {
    scenes.push({ el, timeline })
}

export function initScrollEngine() {
    window.addEventListener('scroll', () => {
        const vh = window.innerHeight

        scenes.forEach(scene => {
            const rect = scene.el.getBoundingClientRect()

            // scene range
            const start = vh * 0.8
            const end = -rect.height * 0.2

            let progress = (start - rect.top) / (start - end)
            progress = Math.min(Math.max(progress, 0), 1)

            scene.timeline.seek(scene.timeline.duration * progress)
        })
    })
}
