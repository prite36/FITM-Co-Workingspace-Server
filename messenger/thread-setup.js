import messages from './messages'
import api from './api'

const setPersistentMenu = () => {
  api.callThreadAPI(messages.persistentMenu)
}

module.exports = {
  setPersistentMenu
}
