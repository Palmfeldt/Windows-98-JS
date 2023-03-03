
/**
 * Adds the boilerplate window
 */
const template = document.createElement('template')
template.innerHTML = `
<link rel="stylesheet" href="css/windows.css">
<body>
  <div class="topBar">
    <div class="window-icon"></div>
    <b class="window-title"></b>
    <img class="close-icon" src="./img/close.gif" alt="close">
  </div>
  <div class="content-div"></div>
</body>
`
let z = 1

export class WindowBox extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this._container = this.shadowRoot.querySelector('.content-div')
    this._header = this.shadowRoot.querySelector('.topBar')
    this._windowIcon = this.shadowRoot.querySelector('.window-icon')
    this._windowTitle = this.shadowRoot.querySelector('.window-title')
    this._closeicon = this.shadowRoot.querySelector('.close-icon')

    this.addEvents(this._header)
  }

  connectedCallback () {
  }

  addEvents (element) {
    let initialX = 0
    let initialY = 0
    let newX = 0
    let newY = 0

    /** increase z index to move window to front */
    this.addEventListener('click', (e) => { this.style.zIndex = z++ })

    /** when clicking x, close window  */
    this._closeicon.addEventListener('click', this.remove.bind(this))

    /** when user drags down window */
    element.addEventListener('mousedown', dragOn)

    /**
     * Take the mouse position and add events to the mouse movements
     *
     * @param {*} e Mouseventlistner object
     */
    function dragOn (e) {
      this.offsetParent.style.zIndex = z++
      this.offsetParent.focus()
      /** get mouse current position */
      initialX = e.clientX
      initialY = e.clientY

      /** stop moving window when mouse leave or mouse up */
      document.addEventListener('mouseup', stopMove)
      document.addEventListener('mouseleave', stopMove)

      /** start dragging while mouse moving */
      document.addEventListener('mousemove', onMove)
    }

    /**
     * Move the captured element inside the browser page
     *
     * @param {*} e Mouseventlistner object
     */
    function onMove (e) {
      /** calculare new position for mouse */
      newX = initialX - e.clientX
      newY = initialY - e.clientY
      initialX = e.clientX
      initialY = e.clientY

      /** calculate new position for window */
      let top = element.offsetParent.offsetTop - newY + 'px'
      let left = element.offsetParent.offsetLeft - newX + 'px'

      /** if window is outside of desktop */
      if (left < '0') {
        left = 0
      }
      if (top < '0') {
        top = 0
      }

      /** set the element final position */
      element.offsetParent.style.left = left
      element.offsetParent.style.top = top
    }

    /** Remove the eventlisener if the windows stops moving */
    function stopMove () {
      document.removeEventListener('mousemove', onMove)
    }
  }
}
/** define the window as a custom HTML element */
window.customElements.define('window-container', WindowBox)
