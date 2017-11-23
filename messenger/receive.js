// ////////////////// Import DATA  //////////////////
const firebaseDB = require('./firebaseDB')
const send = require('./send')
const messageRecieve = require('./messageRecieve')
// ///////////// receivedMessage //////////////////
const receivedMessage = (event) => {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfMessage = event.timestamp
  var message = event.message
  console.log('Received message for user %d and page %d at %d with message:',
  senderID, recipientID, timeOfMessage)
  // var messageId = message.mid
  var messageText = message.text
  if (messageText) {
    firebaseDB.checkUserData(senderID).then(value => {
      // /////////////////////////////////// Student Register ////////////////////////////////////////// //
      if (value.menu === 'regStudent' && /57\d{11}/.test(messageText)) {
        console.log('Go to Register student' + messageText)
        const emailStudent = 's' + messageText + '@email.kmutnb.ac.th'
        let updateData = {
          data: {
            email: emailStudent
          },
          status: 'student'
        }
        firebaseDB.updateStateUser(senderID, 'updateData', updateData)
        // ส่งค่าไปทำงานใน Function พร้อมกับรับค่ามา เพื่อ updateStateUser
        let updateToken = send.sendEmail(senderID, emailStudent)
        firebaseDB.updateStateUser(senderID, 'SendEmail', updateToken)
        send.sendTextMessage(senderID, messageRecieve.willSendInfo[value.language] + messageText + messageRecieve.tellGetKey[value.language])
      } else if (value.menu === 'regStudent') {
        send.sendTextMessage(senderID, messageRecieve.stdIdErr[value.language])
              // /////////////////////////////////// personnel Register ////////////////////////////////////////// //
      } else if (value.menu === 'regPersonnel' && /\w\.\w@email\.kmutnb\.ac\.th/.test(messageText)) {
        console.log('Go to Register Personnel' + messageText)
        let updateData = {
          data: {
            email: messageText
          },
          status: 'personnel'
        }
        firebaseDB.updateStateUser(senderID, 'updateData', updateData)
        let updateToken = send.sendEmail(senderID, messageText)
        firebaseDB.updateStateUser(senderID, 'SendEmail', updateToken)
        send.sendTextMessage(senderID, messageRecieve.willSendInfo[value.language] + messageText + messageRecieve.tellGetKey[value.language])
      } else if (value.menu === 'regPersonnel') {
        send.sendTextMessage(senderID, messageRecieve.emailErr[value.language])
            // /////////////////////////////////// waitkey Register ////////////////////////////////////////// //
      } else if (value.menu === 'waitTokenVerify') {
        firebaseDB.checkVerify(senderID, messageText)
      }
    }).catch(error => console.error(error))
  }
}
// ///////////// receivedPostback //////////////////
const receivedPostback = (event) => {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp
  var payload = event.postback.payload
  console.log('Received postback for user %d and page %d with payload %s ' + 'at %d', senderID, recipientID, payload, timeOfPostback)
  firebaseDB.checkUserData(senderID).then(value => {
    if (payload.includes('GET_STARTED')) {
      firebaseDB.checkUserGetStart(senderID)
    } else if (payload === 'student') {
      firebaseDB.updateStateUser(senderID, 'register', 'regStudent')
      send.sendTextMessage(senderID, messageRecieve.inputstdID[value.language])
    } else if (payload === 'personnel') {
      firebaseDB.updateStateUser(senderID, 'register', 'regPersonnel')
      send.sendTextMessage(senderID, messageRecieve.reqtecherEmail[value.language])
    } else if (payload === 'selectBooking') {
      send.selectBookingMenu(senderID)
    } else if (payload.includes('cancleBooking')) {
      firebaseDB.deleteBookingDb(payload.replace('cancleBooking', ''))
    } else if (payload === 'changeLanguage') {
      send.selectLanguage(senderID)
    } else if (payload === 'en') {
      firebaseDB.swapLanguage(senderID, 'en')
    } else if (payload === 'th') {
      firebaseDB.swapLanguage(senderID, 'th')
    }
  }).catch(error => console.error(error))
}

module.exports = {
  receivedMessage,
  receivedPostback
}
