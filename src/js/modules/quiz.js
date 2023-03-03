import { WindowBox } from './windows.js'

/** Quiz game content */
const chatContainer = document.createElement('template')
chatContainer.innerHTML = `
<link rel="stylesheet" href="css/programs/quizApp.css">
<div class="chatAppContainer">
  <h3> Quiz App! </h3>
  <input id="username" type="text" placeholder="Your username here...">
  <p></p>
  <button id="startQuiz">Press start to start the quiz</button>
  <p></p>
  <h3 id="message"></h3>
  <div id="questionBox">
    <h2 id="questionName"></h2>
    <select name="quizAnswers" id="listofAnswers" multiple></select>
    <input id="answerInput" placeholder="Your answer here" type="text">
    <p></p>
    <button id="submit">Submit</button>
  </div>
  <p id="time"></p>
  <p></p>
  <div id="scoreboard"></div>
</div>
`

/**
 * Creates a Quiz game that extends windowbox functionality.
 */
export class QuizApp extends WindowBox {
  constructor () {
    super()

    this._container.appendChild(chatContainer.content.cloneNode(true))
    this._windowTitle.textContent += 'Quiz App'
    this._chatContainer = this.shadowRoot.querySelector('.chatAppContainer')
    this._observerModeButton = this.shadowRoot.querySelector('#observerMode')
    this._closeicon = this.shadowRoot.querySelector('.close-icon')
    this._startUrl = 'https://courselab.lnu.se/quiz/question/1'

    this.startButton = this.shadowRoot.querySelector('#startQuiz')
    this.username = this.shadowRoot.querySelector('#username')
    this.answerInput = this.shadowRoot.querySelector('#answerInput')
    this.submitButton = this.shadowRoot.querySelector('#submit')
    // Hides the question div
    this.questionBox = this.shadowRoot.querySelector('#questionBox')
    this.questionBox.style.display = 'none'
    // hide scoreboard at start
    this.shadowRoot.getElementById('scoreboard').style.display = 'none'

    // Hides the multiple choise boxes
    this.listofAnswers = this.shadowRoot.querySelector('#listofAnswers')
    this.listofAnswers.style.display = 'none'
    this.url = ''
    this.maxTime = 10
    this.currentTime = this.maxTime
    this.totalTime = 0
    this.interval = null
  }

  // check for button press to start game
  connectedCallback () {
    this.startButton.addEventListener('click', (e) => {
      this.startQuiz(this._startUrl)
    })

    this.submitButton.addEventListener('click', (e) => {
      // Sends data to server and get data back
      this.submitData()
    })
  }

  /**
   * Listens for button press
   * Sends data to server and get data back
   */
  async submitData () {
    let answer = ''
    // check if its a list based answer or input
    if (!this.answerInput.readOnly) {
      // grabs the answer from the input
      answer = this.answerInput.value
    } else {
      // will error if no input is supplied
      answer = this.listofAnswers.options[this.listofAnswers.selectedIndex].value
    }

    const answerJson = { answer }
    const config = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(answerJson) }
    const response = await fetch(this.url, config)
    let jsonData = await response.json() // this will return the response after the post
    // This will display a message to see if the answer was correct
    this.displayData(jsonData)

    if (response.ok && Object.prototype.hasOwnProperty.call(jsonData, 'nextURL')) {
      jsonData = await this.getQuestion(jsonData.nextURL)
      this.displayData(jsonData)

      // This will not work for the last answer
    } else if (response.status === 400) {
      this.looseQuiz(false)
    } else if (response.ok && !Object.prototype.hasOwnProperty.call(jsonData, 'nextURL')) {
      this.winQuiz()
    }
  }

  /**
   * Displays the recived json, start and stops the timer.
   *
   * @param {json} json takes the grabbed json
   */
  async displayData (json) {
    this.url = json.nextURL

    // if the data contains a message, display it
    if (Object.prototype.hasOwnProperty.call(json, 'message') && !Object.prototype.hasOwnProperty.call(json, 'question')) {
      this.shadowRoot.getElementById('message').innerText = json.message
    }
    // if quiz has alternativites. Then run a for loop and display all answers
    if (Object.prototype.hasOwnProperty.call(json, 'alternatives')) {
      this.answerInput.readOnly = true
      this.answerInput.style.display = 'none'
      // lock original answer field
      this.answerInput.value = ''
      this.listofAnswers.style.display = 'inline'
      // clear all the entries
      this.listofAnswers.innerHTML = ''

      // Add in the answer options
      for (const x in json.alternatives) {
        const option = document.createElement('option')
        option.text = json.alternatives[x]
        option.value = x
        this.listofAnswers.add(option)
      }
    } else {
      this.answerInput.style.display = 'inline'
      this.answerInput.readOnly = false
      this.listofAnswers.style.display = 'none'
      this.answerInput.focus()
      this.answerInput.select()
    }
    this.stopTimer()
    this.startTimer()
    this.shadowRoot.getElementById('questionName').innerText = json.question
  }

  /**
   * Win the quiz
   */
  async winQuiz () {
    this.stopTimer()
    this.storeData(this.username.value, this.totalTime)
    this.shadowRoot.getElementById('message').innerText = 'Congratz you won. It only took ' + this.totalTime + ' seconds.'
    this.questionBox.style.display = 'none'
    this.startButton.style.display = 'block'
    this.username.style.display = 'block'
  }

  /**
   * As it says on the tin gets the json data from a given url
   *
   * @param {string} url Takes the current question url
   * @returns {json} Returns a json object
   */
  async getQuestion (url) {
    const response = await fetch(url)
    return await response.json()
  }

  /**
   * Gets the first question and displays it on the webpage
   *
   * @param {any} url Takes the start url of the quiz.
   */
  async startQuiz (url) {
    this.shadowRoot.getElementById('scoreboard').style.display = 'none'
    // just a preventative mesure to remove old scores
    this.shadowRoot.getElementById('scoreboard').innerHTML = ''
    // clear previous messages
    const messages = this.shadowRoot.querySelector('#message')
    messages.innerText = ''
    this.answerInput.value = ''

    // gets the username and checks if it is not empty

    if (this.username.value.trim().length > 0) {
      // Gets the json data from the url
      const jsonData = await this.getQuestion(url)
      // disables the button
      this.startButton.style.display = 'none'
      this.username.style.display = 'none'
      this.questionBox.style.display = 'inline'
      this.displayData(jsonData)
    } else {
      alert('Please enter a username')
    }
  }

  /**
   * Handles the loosing logic
   * Such as reseting the game and displaying a game over sign
   *
   * @param {boolean} timeout if the time has ran out
   */
  looseQuiz (timeout) {
    this.stopTimer()
    if (timeout) {
      this.shadowRoot.getElementById('message').innerText = 'Time ran out, sorry'
    }

    this.startButton.style.display = 'block'
    this.username.style.display = 'block'

    this.questionBox.style.display = 'none'
    this.showScoreboard()
  }

  /**
   * Stores the data in localstorage
   *
   * @param {string} username Takes the player's username
   * @param {number} points Takes the player's totaltime from timer
   */
  async storeData (username, points) {
    // Store data in json
    let topScores = JSON.parse(window.localStorage.getItem('topScores'))
    if (topScores == null || topScores.length === 0) {
      topScores = []
    }
    topScores.push({ name: username, score: points })
    topScores.sort((p1, p2) => { return p1.score - p2.score })
    topScores.splice(5)
    window.localStorage.setItem('topScores', JSON.stringify(topScores))
    this.showScoreboard()
  }

  /**
   * Shows the scoreboard for the usernames
   */
  showScoreboard () {
    this.shadowRoot.getElementById('scoreboard').style = 'inline'
    const storage = JSON.parse(window.localStorage.getItem('topScores'))
    if (storage === null) {
      this.shadowRoot.getElementById('scoreboard').innerText = 'No records yet.'
    } else {
      // Creates the list element
      const listElement = document.createElement('ul')
      listElement.setAttribute('id', 'scoreList')
      const titleElement = document.createElement('p')
      titleElement.textContent = 'Top Scores: '
      this.shadowRoot.getElementById('scoreboard').appendChild(titleElement)
      this.shadowRoot.getElementById('scoreboard').appendChild(listElement)
      for (let i = 0; i < storage.length; i++) {
        const scoreText = i + 1 + '.   ' + storage[i].name + ': ' + storage[i].score + ' Seconds.'
        const entry = document.createElement('li')
        entry.appendChild(document.createTextNode(scoreText))
        listElement.appendChild(entry)
      }
    }
  }

  /**
   * Function starts a 10 second timer
   */
  startTimer () {
    this.shadowRoot.getElementById('time').innerText = '10 seconds remaining'
    this.currentTime = this.maxTime
    this.interval = setInterval(() => {
      this.currentTime--
      this.displayTime()
      this.totalTime++
      if (this.currentTime <= 0) {
        this.displayTime()
        this.looseQuiz(true)
        this.stopTimer()
      }
    }, 1000)
  }

  /*
   * As it says on the tin. Displays the time in the index page
   */
  displayTime () {
    const timer = this.currentTime + ' seconds remaining'
    this.shadowRoot.getElementById('time').innerText = timer
  }

  /**
   * Stops the timer
   */
  stopTimer () {
    clearInterval(this.interval)
    this.totalTime = this.totalTime + (this.maxTime - this.currentTime)
  }
}

/** define quiz-app as a custom HTML element */
window.customElements.define('quiz-app', QuizApp)
