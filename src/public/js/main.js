import { loadStartMenu, loadDeskIcons, clockWatch } from './modules/startup.js'
import './modules/memory.js'
import './modules/chat.js'
import './modules/quiz.js'
import './modules/recycle.js'
import './modules/thisComputer.js'

loadStartMenu()
loadDeskIcons()

const clickSound = new Audio('sound/CLICK.WAV')

document.getElementById('main').addEventListener('dblclick', unhighlight)

/**
 *
 */
function unhighlight () {
  const highlights = document.querySelectorAll('.highlightedProgram')
  if (highlights.length !== 0) {
    highlights.forEach(hightlight => {
      hightlight.classList.remove('highlightedProgram')
    })
  }
}

/**
 *
 */
function updateTime () {
  clockWatch()
}
setInterval(updateTime, 5000)

// dynamic programclicker
const programs = document.querySelectorAll('.desktopProgram')
// Add an event listener to each card
programs.forEach(program => {
  program.addEventListener('click', (e) => {
    unhighlight()
    // making so you can only select the program
    if (e.target.classList.contains('desktopProgram')) {
      e.target.classList.add('highlightedProgram')
    } else {
      e.target.parentElement.classList.add('highlightedProgram')
    }
  })

  program.addEventListener('dblclick', (e) => {
    let runProgram
    // making so you can only select the program, not the icon
    if (e.target.classList.contains('desktopProgram')) {
      runProgram = document.createElement(e.target.dataset.value)
    } else {
      runProgram = document.createElement(e.target.parentElement.dataset.value)
    }
    // if not computer app, then play click
    if (runProgram.tagName !== 'COMPUTER-APP') {
      clickSound.play()
    }
    // add window ontop of icons
    runProgram.style.zIndex = 2
    document.querySelector('.mainscreen').appendChild(runProgram)
  })
})
