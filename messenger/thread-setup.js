
const api = require('./api')
const messages = require('./messages')
const setPersistentMenu = () => {
  api.callThreadAPI(messages.persistentMenu)
}

module.exports = {
  setPersistentMenu
}
