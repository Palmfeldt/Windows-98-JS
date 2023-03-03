import { WindowBox } from './windows.js'

/** Memory game content */
const gameContainer = document.createElement('template')
gameContainer.innerHTML = `
<link rel="stylesheet" href="css/programs/memoryGame.css">
<div class="memoryGameContainer">
  <h3 id="gameState"> Memory Game! </h3>
  <p id="numberCounter">Number of guesses: 0</p>
  <p id="timedCounter">Time passed: 0</p>
  <div id="game-board"></div>
  <button id="stopButton">Stop Game</button>
  <button id="startButton">Start Game</button>
  <button id="startTimedButton">Start Timed Game</button>
  <fieldset id="gameOption">
    <div class="field-row">Select number of tiles:</div>
    <div class="field-row">
      <input value="4" id="radio10" type="radio" name="game-Type">
      <label for="radio10">2x2 grid</label>
    </div>
    <div class="field-row">
      <input value="8" id="radio11" type="radio" name="game-Type">
      <label for="radio11">2x4 grid</label>
    </div>
    <div class="field-row">
      <input checked="checked" value="16" id="radio12" type="radio" name="game-Type">
      <label for="radio12">4x4 grid</label>
    </div>
  </fieldset>
</div>
`

/**
 * Creates a memory game that extends windowbox functionality.
 */
export class MemoryGame extends WindowBox {
  constructor () {
    super()

    this._container.appendChild(gameContainer.content.cloneNode(true))
    this._windowTitle.textContent += 'Memory Game'
    this._gameContainer = this.shadowRoot.querySelector('.memoryGameContainer')
    this._startButton = this.shadowRoot.querySelector('#startButton')
    this._startTimedButton = this.shadowRoot.querySelector('#startTimedButton')
    this._stopButton = this.shadowRoot.querySelector('#stopButton')
    this._closeicon = this.shadowRoot.querySelector('.close-icon')

    this.timedCounter = this.shadowRoot.querySelector('#timedCounter')
    this.timedCounter.classList.add('hidden')
    this.numberCounter = this.shadowRoot.querySelector('#numberCounter')
    this.numberCounter.classList.add('hidden')

    // GameLogic variables
    this.cards = null
    this.tilesNumbers = 0
    // Keep track of the arrow position
    this.currentArrowPos = 0
    this.hasStartedArrows = false

    // number of guesses the user has taken
    this.noOfGuesses = 0

    // Keep track of first and second card.
    this.firstCard = null
    this.secondCard = null
    //
    this.lockBoard = false
    // this is the fontside of the figure
    this.frontside = './img/memoryGame/question.png'
    this.gameFig = []

    // timing related stuff
    this.isTimed = false
    this.totalTime = 0
    this.interval = null
  }

  // check for global button presses
  connectedCallback () {
    const radioButtons = this.shadowRoot.getElementById('gameOption')
    /** got the values of radio buttons to create the game grid */
    this._startButton.addEventListener('click', (e) => {
      this.isTimed = false
      // hide the radio elements
      radioButtons.style.display = 'none'
      this.tilesNumbers = this.shadowRoot.querySelector('input[name="game-Type"]:checked').value
      this.initGame(this.isTimed)
    })
    this._startTimedButton.addEventListener('click', (e) => {
      // hide the radio elements
      radioButtons.style.display = 'none'
      this.tilesNumbers = this.shadowRoot.querySelector('input[name="game-Type"]:checked').value
      this.isTimed = true
      this.initGame(this.isTimed)
    })

    // if the game is reset
    this._stopButton.addEventListener('click', (e) => {
      radioButtons.style.display = 'block'
      this.resetGame()
    })
  }

  // select the number of tiles
  initGame (isTimed) {
    this.shadowRoot.getElementById('gameState').innerText = 'Memory Game!'
    this.noOfGuesses = 0
    this.numberCounter.innerText = 'Number of guesses: 0'
    // if game is timed, then only display number of seconds. No guesses
    if (isTimed) {
      this.timedCounter.classList.remove('hidden')

      this._startButton.classList.add('hidden')
      this._startTimedButton.classList.remove('hidden')
      this._startTimedButton.innerText = 'Restart Game'
      this.startTimer()
    } else {
      this.numberCounter.classList.remove('hidden')
      this._startTimedButton.classList.add('hidden')
      this._startButton.innerText = 'Restart Game'
    }

    // Contains the paths for the game figures
    const imgPath = './img/memoryGame/'
    this.gameFig[0] = imgPath + 'apple.png'
    this.gameFig[1] = imgPath + 'butterfly.png'
    this.gameFig[2] = imgPath + 'tree.png'
    this.gameFig[3] = imgPath + 'moon.png'
    this.gameFig[4] = imgPath + 'chess.png'
    this.gameFig[5] = imgPath + 'ew.png'
    this.gameFig[6] = imgPath + 'floppy.png'
    this.gameFig[7] = imgPath + 'hourglass.png'
    this.boardCreator(this.tilesNumbers)
  }

  // randomly selects figures and places them on board
  boardCreator (tileNumbers) {
    const gameboard = this.shadowRoot.getElementById('game-board')
    const currentPieces = []
    gameboard.innerText = ''
    while (currentPieces.length < tileNumbers) {
      const randNum = Math.round(Math.random() * (this.gameFig.length - 1))
      // if the random figure is not in the list then add it
      if (!currentPieces.includes(randNum)) {
        currentPieces.push(randNum, randNum)
      }
    }
    // Create the new images and place them
    while (currentPieces.length > 0) {
      const randomPiece = currentPieces[Math.floor(Math.random() * currentPieces.length)]
      const imageElement = document.createElement('img')
      imageElement.className = 'card'
      imageElement.setAttribute('data-value', randomPiece)
      // this is used by the arrow keys
      imageElement.setAttribute('id', currentPieces.length)

      imageElement.setAttribute('src', this.frontside)
      imageElement.setAttribute('alt', 'fig')
      gameboard.appendChild(imageElement)

      const index = currentPieces.indexOf(randomPiece)
      if (index > -1) { // only splice array when item is found
        currentPieces.splice(index, 1) // 2nd parameter means remove one item only
      }
    }
    // update the cards variable
    this.cards = this.shadowRoot.querySelectorAll('.card')
    // Add an event listener to each card
    this.cards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.cardLogic(e.target)
      })
    })
    // get the start arrow position
    this.currentArrowPos = parseInt(this.tilesNumbers)
    if (!this.hasStartedArrows) {
      document.addEventListener('keydown', e => this.arrowSelect(e))
    }
  }

  /* This is the function used to select a card */
  arrowSelect (events) {
    switch (events.key) {
      case 'ArrowLeft':
        this.arrowSelectLogic(false)
        break

      // right arrow
      case 'ArrowRight':
        this.arrowSelectLogic(true)
        break

      case ' ':
        this.cardLogic(this.shadowRoot.querySelector('.cardSelection'))
        break
    }
  }

  arrowSelectLogic (gotoRight) {
    // Check if player has moved selection
    if (this.hasStartedArrows) {
      // if user went to right
      if (gotoRight) {
        this.currentArrowPos--
        this.shadowRoot.getElementById(this.currentArrowPos + 1).classList.remove('cardSelection')
      } else {
        this.currentArrowPos++
        this.shadowRoot.getElementById(this.currentArrowPos - 1).classList.remove('cardSelection')
      }
      // if user goes below zero
      if (this.currentArrowPos <= 0) {
        this.currentArrowPos = this.tilesNumbers
      } else if (this.currentArrowPos > parseInt(this.tilesNumbers)) {
        this.currentArrowPos = 1
      }
      // if a selection is done, then delete it
    }
    this.hasStartedArrows = true
    this.shadowRoot.getElementById(this.currentArrowPos).classList.add('cardSelection')
  }

  // Resets the board to startpage
  resetGame () {
    this.shadowRoot.getElementById('gameState').innerText = 'Memory Game!'
    this._startButton.innerText = 'Start Game'
    this._startTimedButton.innerText = 'Start Timed Game'
    this.noOfGuesses = 0
    this.numberCounter.innerText = 'Number of guesses: 0'
    this.shadowRoot.getElementById('game-board').innerHTML = ''
    this.numberCounter.classList.add('hidden')
    this.timedCounter.classList.add('hidden')
    this._startButton.classList.remove('hidden')
    this._startTimedButton.classList.remove('hidden')
  }

  cardLogic (card) {
    // If board is locked, then do nothing
    // If the card is matched, then do nothing
    // if the card is already selected, then do nothing
    if (this.lockBoard || card.classList.contains('matched') || card.classList.contains('selected')) {
      return false
    }

    // if two are already selected then wait til the timeout
    if (this.firstCard != null && this.secondCard != null) {
      if (this.firstCard.classList.contains('selected') && this.secondCard.classList.contains('selected')) {
        return false
      }
    }
    // Flip the card over by adding the 'selected' class
    card.classList.add('selected')
    card.innerText = card.dataset.value
    //  = e.getAttribute('data-type');

    // If it is the first card that was clicked, set it as the first card and return
    if (!this.firstCard) {
      this.firstCard = card
      // set the image to the value
      this.firstCard.setAttribute('src', this.gameFig[this.firstCard.dataset.value])
      return false
    } // If this is the second card that was clicked, set it as the second card
    this.secondCard = card
    this.secondCard.setAttribute('src', this.gameFig[this.secondCard.dataset.value])

    // Check if the two cards match
    this.checkForMatch()
  }

  checkForMatch () {
    this.noOfGuesses++
    this.numberCounter.innerText = 'Number of guesses: ' + this.noOfGuesses
    // If the two cards have the same value, add the matched class
    if (this.firstCard.dataset.value === this.secondCard.dataset.value) {
      this.firstCard.classList.add('matched')
      this.secondCard.classList.add('matched')
      this.resetBoard()
      // if all are matched then you win
      if (this.shadowRoot.querySelectorAll('.card').length === this.shadowRoot.querySelectorAll('.matched').length) {
        this.youWon()
      }
      return true
    }

    // If the two cards do not match, flip them back over after a short delay
    setTimeout(() => {
      this.firstCard.setAttribute('src', this.frontside)
      this.secondCard.setAttribute('src', this.frontside)
      this.resetBoard()
    }, 1000)
  }

  youWon () {
    // used to remove the eventlisteners for each cards.
    const oldGame = this.shadowRoot.getElementById('game-board')
    oldGame.parentNode.replaceChild(this.shadowRoot.getElementById('game-board').cloneNode(true), oldGame)

    if (this.isTimed) {
      this.shadowRoot.getElementById('gameState').innerText = 'You won with ' + this.totalTime + ' seconds total time'
    } else {
      this.shadowRoot.getElementById('gameState').innerText = 'You won with ' + this.noOfGuesses + ' number of moves'
    }
    const audio = new Audio('sound/TADA.WAV')
    audio.play()
    if (this.isTimed) {
      this.stopTimer()
    }
  }

  // Reset the first and second cards and unlock the board
  resetBoard () {
    this.firstCard.classList.remove('selected')
    this.secondCard.classList.remove('selected')
    this.firstCard.classList.remove('cardSelection')
    this.secondCard.classList.remove('cardSelection')
    this.firstCard = null
    this.secondCard = null
    this.lockBoard = false
  }

  /**
   * Function starts a timer and display it
   */
  startTimer () {
    // if timer is already active, clear it
    if (this.interval != null) {
      clearInterval(this.interval)
      this.totalTime = 0
      this.timedCounter.innerText = 'Time passed: ' + this.totalTime
    }
    this.interval = setInterval(() => {
      this.totalTime++
      this.timedCounter.innerText = 'Time passed: ' + this.totalTime
    }, 1000)
  }

  /**
   * Stops the timer
   */
  stopTimer () {
    clearInterval(this.interval)
    this.totalTime = 0
    this.isTimed = false
  }
}

/** define memory-app as a custom HTML element */
window.customElements.define('memory-game', MemoryGame)
