import { WindowBox } from './windows.js'

/** recycle bin content */
const recycleContainer = document.createElement('template')
recycleContainer.innerHTML = `
  <link rel="stylesheet" href="css/programs/recycleApp.css">
  <div class="recycleAppContainer">
  <div id="insideBox"> 
  <div>
    <h3>CowSay</h3>
    <div id="inputDiv">
      <p>"Pipe" cowsay text here: </p>
      <input type="text" id="cowsayInput" maxlength="40"/>
      <button id="cowsayStart">Say this</button>
    </div>
    <pre id="cowBox">
  ----------------------------------------
  <pre id="cowsay-txt"></pre>
  ----------------------------------------
          &bsol;  ^__^
           &bsol; (oo)&bsol;_______
             (__)&bsol; 0   0 )&bsol;  *
                ||--0-w |  &bsol;/
                ||     ||
    </pre>
  </div>
`

export class RecycleApp extends WindowBox {
  constructor () {
    super()

    this._container.appendChild(recycleContainer.content.cloneNode(true))
    this._windowTitle.textContent += 'Recycle Bin'
    this._chatContainer = this.shadowRoot.querySelector('.recycleAppContainer')
    this._closeicon = this.shadowRoot.querySelector('.close-icon')

    this.cowsayRun = this.shadowRoot.querySelector('#cowsayStart')
    this.cowsayOutput = this.shadowRoot.querySelector('#cowsay-txt')
    this.userInput = this.shadowRoot.querySelector('#cowsayInput')
  }

  connectedCallback () {
    this.cowsayRun.addEventListener('click', (e) => {
      this.cowsayThis()
    })
  }

  cowsayThis () {
    if (this.userInput.value.includes('!')) {
      this.cowsayOutput.innerHTML = 'MOO MOO MOO, ' + this.htmlEncode(this.userInput.value.toUpperCase())
    } else {
      this.cowsayOutput.innerHTML = 'Moo, ' + this.htmlEncode(this.userInput.value)
    }
  }

  /**
   * Encode HTML entities to prevent xss
   *
   * @param {string} html string input of the the cowsay input
   * @returns {string} formatted string
   */
  htmlEncode (html) {
    return document.createElement('a').appendChild(
      document.createTextNode(html)).parentNode.innerHTML
  };
}

/** define recycle-app as a custom HTML element */
window.customElements.define('recycle-app', RecycleApp)
