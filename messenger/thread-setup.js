
// const api = require('./api')
const messages = require('./messages')
const send = require('./send')
const setPersistentMenu = () => {
  // api.callThreadAPI(messages.persistentMenu)
  send.callSendAPI(messages.persistentMenu)
}

module.exports = {
  setPersistentMenu
}
