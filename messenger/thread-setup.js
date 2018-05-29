const messages = require('./messages')
const send = require('./send')
const setPersistentMenu = () => {
  send.callSendAPI('thread_settings', messages.persistentMenu)
}

module.exports = {
  setPersistentMenu
}
