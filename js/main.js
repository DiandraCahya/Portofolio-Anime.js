import { initScrollEngine } from './core/ScrollEngine.js'
import introScene from './scenes/intro.js'
import identityScene from './scenes/identity.js'
import worksScene from './scenes/works.js'

document.addEventListener('DOMContentLoaded', () => {
  introScene()
  identityScene()
  worksScene()
  initScrollEngine()
})
