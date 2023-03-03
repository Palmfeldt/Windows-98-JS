import { WindowBox } from './windows.js'

/** Memory game content */
const chatContainer = document.createElement('template')
chatContainer.innerHTML = `
<link rel="stylesheet" href="css/programs/chatApp.css">
<div class="chatAppContainer">
  <div id="chat-window">
    <!-- Chat messages start here -->
    <!-- Chat messages end here -->
  </div>
  <div id="settingsPage">
    <input id="channelname" type="text" placeholder="Enter channelname...">
    <input id="username" type="text" placeholder="Enter username...">
    <button id="saveConfig">Save settings</button>
    <button id="observerMode">Start eavesdropping</button>
    <p id="infobar"></p>
  </div>
  <div id="message-form">
    <input id="messageBox" type="text" placeholder="Enter a message...">
    <button id="sendMessage">Send</button>
  </div>
</div>
`

/**
 * Creates a memory game that extends windowbox functionality.
 */
export class ChatApp extends WindowBox {
  constructor () {
    super()

    this._container.appendChild(chatContainer.content.cloneNode(true))
    this._windowTitle.textContent += 'Chat App'
    this._chatContainer = this.shadowRoot.querySelector('.chatAppContainer')
    this._sendMessageButton = this.shadowRoot.querySelector('#sendMessage')
    this._messageBox = this.shadowRoot.querySelector('#messageBox')
    this._saveConfig = this.shadowRoot.querySelector('#saveConfig')
    this._observerModeButton = this.shadowRoot.querySelector('#observerMode')
    this._closeicon = this.shadowRoot.querySelector('.close-icon')

    this.username = this.shadowRoot.querySelector('#username')
    this.channelname = this.shadowRoot.querySelector('#channelname')
    this.infobar = this.shadowRoot.querySelector('#infobar')
    this.socket = null
    this.cachedMessages = []

    this.getMessageCache()
    // if username is not empty from local storage
    if (window.localStorage.getItem('userConf') !== null) {
      this.username.value = JSON.parse(window.localStorage.getItem('userConf')).username
      this.channelname.value = JSON.parse(window.localStorage.getItem('userConf')).channelname
      this.startChat()
    } else {
      this._sendMessageButton.disabled = true
      this._messageBox.disabled = true
    }
  }

  // check for button press to start game
  connectedCallback () {
    this._saveConfig.addEventListener('click', (e) => {
      // remember to hide the radio elements
      this.saveConfig()
    })

    this._observerModeButton.addEventListener('click', (e) => {
      this.triggerObserver()
    })

    this._closeicon.addEventListener('click', (e) => {
      this.cacheMessages()
    })
  }

  triggerObserver () {
    // if observermode is on, then disable it
    // if observermode is enabled
    if (this.observerMode) {
      this.socket.close()
      console.log('socket has been closed', this.socket)
      this.observerMode = false
      this.username.disabled = false
      this.saveConfig.disabled = false
      this.channelname.disabled = false
      // to check if channel has been selected
      if (window.localStorage.getItem('userConf') == null) {
        this._sendMessageButton.disabled = true
        this._messageBox.disabled = true
      } else {
        this._sendMessageButton.disabled = false
        this._messageBox.disabled = false
      }
      // if observermode has not been selected
      // then run it
    } else {
      // if socket is not initialized, or if initalized but closed
      if (this.socket == null || this.socket.readyState !== this.socket.OPEN) {
        console.log('socket was closed, now openining')
        this.connect()
      }
      this.saveConfig.disabled = true
      this.observerMode = true
      this.username.disabled = true
      this.channelname.disabled = true
      this._sendMessageButton.disabled = true
      this._messageBox.disabled = true
    }
  }

  /**
   * Displays the messages inside chat-window
   *
   * @param {string} username username
   * @param {string} message message text
   * @param {boolean} isSelf if this is local user sending the message
   * @param {string} time a formatted time string
   */
  displayMessage (username, message, isSelf, time) {
    const messageContainer = document.createElement('div')
    const messageUser = document.createElement('span')
    const messageText = document.createElement('p')
    const messageTime = document.createElement('p')

    messageContainer.classList.add('message-container')
    // check if user is you or someone with the same name
    if (isSelf) {
      messageUser.classList.add('messageSelf')
    } else {
      messageUser.classList.add('messageUser')
    }
    messageText.classList.add('messageText')
    messageTime.classList.add('messageTime')
    messageUser.innerText = username
    messageText.innerText = message
    messageTime.innerText = time

    messageContainer.appendChild(messageUser)
    messageContainer.appendChild(messageTime)
    messageContainer.appendChild(messageText)

    const chatWindow = this.shadowRoot.getElementById('chat-window')
    chatWindow.appendChild(messageContainer)
    // chatmessages autoupdate so it scrolls to the bottom
    chatWindow.scrollTop = chatWindow.scrollHeight
  }

  /**
   * This saves the username and channel varaibles to localdata
   */
  saveConfig () {
    // This checks if channelname and username is valid
    this.username = this.shadowRoot.querySelector('#username')
    this.channelname = this.shadowRoot.querySelector('#channelname')

    if (this.username != null && this.channelname != null) {
      this.username.value = this.username.value.trim()
      this.channelname.value = this.channelname.value.trim()
      /** If username and channelname is not empty */
      if (this.username.value.length > 0 && this.channelname.value.length > 0) {
        // enable messagebox and username
        this._sendMessageButton.disabled = false
        this._messageBox.disabled = false
        window.localStorage.setItem('userConf', JSON.stringify({
          username: this.username.value,
          channelname: this.channelname.value
        }))
        this.infobar.innerText = ''
        this.startChat()
      }
    } else {
      this.infobar.innerText = 'Error: Select a valid name and channel'
    }
  }

  /** send message */
  sendMessage () {
    if (this._messageBox.value.length > 0) {
      this.socket.send(JSON.stringify({
        type: 'message',
        data: this._messageBox.value,
        username: this.username.value,
        channel: this.channelname.value,
        key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
      }))
      // reset value for next message
      this._messageBox.value = ''
      this.infobar.innerText = ''
    }
  }

  /** Start the websocket to the server */
  connect () {
    return new Promise((resolve, reject) => {
      this.socket = new window.WebSocket('wss://courselab.lnu.se/message-app/socket')
      this.socket.onopen = () => resolve()
      this.socket.onerror = error => reject(error)
      this.socket.onmessage = response => {
        this.getMessage(JSON.parse(response.data))
      }
      /** close connection when click on close button  */
      this._closeicon.addEventListener('click', (e) => { this.socket.close() })
    })
  }

  /**
   * Display the message on the page
   *
   * @param {*} message json format message
   */
  getMessage (message) {
    // debug, see all messages
    console.log(message)
    // if message is from the server
    if (message.username === 'The Server' && message.type === 'notification') {
      this.saveMessages(message, this.getTime())
      this.displayMessage(message.username, message.data, true, this.getTime())
    } else {
      /** ignore heartbeat message */
      if (message.type !== 'heartbeat') {
        // if observermode is enabled, then display all messages
        if (!this.observerMode) {
          /**
           * if channel is entered, filter on the message will applied.
           * Only message from the same channel and notification will displayed
           */
          if (message.channel === JSON.parse(window.localStorage.getItem('userConf')).channelname || message.channel === this.channelname.value) {
            // if the message is from the local user, view it as green text
            if (message.username === JSON.parse(window.localStorage.getItem('userConf')).username || message.username === this.username.value) {
              this.saveMessages(message, this.getTime())
              this.displayMessage(message.username, message.data, true, this.getTime())
            } else {
              this.displayMessage(message.username, message.data, false, this.getTime())
              this.saveMessages(message, this.getTime())
            }
          }
        } else {
          this.displayMessage(message.username + ' (Channel: ' + message.channel + ')', message.data, false, this.getTime())
        }
      }
    }
  }

  startChat () {
    /** start connection of web socket */
    if (this.socket != null) {
      // IF socket is open, close it and open with new config
      if (this.socket.readyState === this.socket.OPEN) {
        this.socket.onclose = function () { } // disable onclose handler first
        this.socket.close()
      }
    }
    this.connect().then(() => '').catch(function (error) {
      console.log('WebSocket error: ' + error)
    })

    /** send message when press enter or click on send button */
    this._sendMessageButton.addEventListener('click', (e) => { this.sendMessage() })
    this._messageBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.sendMessage()
      }
    })
  }

  // adds the messages to a list that, on close write it to the local storage
  // pops the 20th message out and adds the latest one
  saveMessages (json, time) {
    if (this.cachedMessages.length === 20) {
      this.cachedMessages.shift()
    }
    const convertedJson = JSON.stringify({
      username: json.username,
      data: json.data,
      time
    })
    this.cachedMessages.push(convertedJson)
  }

  // when closing the chat, store the latest messages
  cacheMessages () {
    window.localStorage.setItem('chatCache', JSON.stringify({
      messageData: this.cachedMessages
    }))
  }

  // grabs the messages from localstorage and displays them
  getMessageCache () {
    // if localstorage is not empty. Then display the last 20 images
    if (localStorage.getItem('chatCache') != null) {
      try {
        const cachedMessages = JSON.parse(window.localStorage.getItem('chatCache'))
        cachedMessages.messageData.forEach((jsonData) => {
          this.displayMessage(JSON.parse(jsonData).username + ' (Old cached)', JSON.parse(jsonData).data, false, JSON.parse(jsonData).time)
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  // get the current time, used for the message
  getTime () {
    const date = new Date()
    const sec = date.getSeconds()
    const min = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
    const h = date.getHours()
    return ('Recieved at: ' + h + ':' + min + ':' + sec)
  }
}

/** define chat-app as a custom HTML element */
window.customElements.define('chat-app', ChatApp)
