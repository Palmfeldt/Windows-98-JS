
const mainPage = document.getElementById('main')
const programs = document.getElementById('programs')
/**
 * Loads the start Menu
 */
// TODO set start inside div to create border
export function loadWindowsBar() {
  const footer = document.createElement('footer')
  footer.setAttribute('id', 'startMenu')
  // Adds the shadow to the box
  footer.setAttribute('class', 'windows-box-shadow')
  footer.innerHTML = `<div id="menuBox"><img src="./img/start.png" 
  alt="logo" style="float: left;"><b id="textBetweenLogo">Start</b></div>`

  // Needed for the border between the text and image

  // adds the clock
  const audioIcon = document.createElement('img')
  audioIcon.setAttribute('src', './img/audio-icon.png')
  audioIcon.setAttribute('id', 'audioIcon')

  const rightTray = document.createElement('div')
  rightTray.setAttribute('id', 'rightTray')
  const clockTime = document.createElement('div')
  clockTime.setAttribute('id', 'clockTime')
  const d = new Date()
  clockTime.innerText = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()
  rightTray.appendChild(audioIcon)
  rightTray.appendChild(clockTime)

  footer.appendChild(rightTray)
  // Adding it to the mainpage
  mainPage.appendChild(footer)

  // adding the start window
  const startWindow = document.createElement('div')
  startWindow.setAttribute('id', 'startWindow')
  startWindow.setAttribute('class', 'windows-box-shadow hidden')
  document.getElementById("startMenu").parentNode.insertBefore(startWindow,  document.getElementById("startMenu"))
}

/**
 * Gives the current time with correct minute presentation
 */
export function clockWatch() {
  const d = new Date()
  document.getElementById('clockTime').innerText = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()
}

/**
 * This is the start icon for the window
 */
// this can be be made generic
export function loadDeskIcons() {
  programs.innerHTML = `
  <div class="desktopProgram" id="memoryGame" data-value="memory-game">
    <img src="./img/potato.png" class="programIcon">
    <figcaption class="programDesc">Memory game</figcaption>
  </div>
  <div class="desktopProgram" id="chatApp" data-value="chat-app">
    <img src="./img/chat.gif" class="programIcon">
    <figcaption class="programDesc">Chat App</figcaption>
  </div>
  <div class="desktopProgram" id="quizApp" data-value="quiz-app">
    <img src="./img/question.png" class="programIcon">
    <figcaption class="programDesc">Quiz App</figcaption>
  </div>
  <div class="desktopProgram" id="recycleApp" data-value="recycle-app">
    <img src="./img/trash.png" class="programIcon">
    <figcaption class="programDesc">Recycle Bin</figcaption>
  </div>
  <div class="desktopProgram" id="computerApp" data-value="computer-app">
    <img src="./img/computer.png" class="programIcon">
    <figcaption class="programDesc">This computer</figcaption>
  </div>
  `
}
