import { WindowBox } from './windows.js'

/** computer popup content */
const computerContainer = document.createElement('template')
computerContainer.innerHTML = `
  <link rel="stylesheet" href="css/programs/computerApp.css">
  <div class="computerAppContainer">
    <div id="insideBox">
    <img src="img/what.png" alt="idk">
    </div>
  </div>
`

export class computerApp extends WindowBox {
  constructor () {
    super()

    this._container.appendChild(computerContainer.content.cloneNode(true))
    this._windowTitle.textContent += 'Warning!'
    this._chatContainer = this.shadowRoot.querySelector('.computerAppContainer')

    this._closeicon = this.shadowRoot.querySelector('.close-icon')
    warningSound.play()
  }

  // check for button press to start game
  connectedCallback () {

  }
}

const warningSound = new Audio('sound/WARNING.WAV')

/** define memory-app as a custom HTML element */
window.customElements.define('computer-app', computerApp)
