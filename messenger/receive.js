// ////////////////// Import DATA  //////////////////
const firebaseDB = require('./firebaseDB')
const send = require('./send')
const messagesText = require('./messagesText')
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
       // ///////////////////////////////////// simlple message //////////////////////////////////////////
      let textTolowerCase = messageText.toLowerCase()
      if (textTolowerCase === 'hello') {
        send.sendTextMessage(senderID, messagesText.sayHello['eng'])
      } else if (textTolowerCase === 'สวัสดี') {
        send.sendTextMessage(senderID, messagesText.sayHello['th'])
      } else if (compareMessageText(textTolowerCase, ['register', 'regis', 'l,y8i', 'l,y8il,k=bd', 'สมัครสมาชิก', 'สมัคร'])) {
        send.registerMenu(senderID)
      } else if (value.menu === 'regStudent' && /57\d{11}/.test(messageText)) {
        // /////////////////////////////////// Student Register ////////////////////////////////////////// //
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
        send.sendTextMessage(senderID, `${messagesText.willSendInfo[value.language]} s${messageText}@email.kmutnb.ac.th ${messagesText.tellGetKey[value.language]}`)
      } else if (value.menu === 'regStudent') {
        send.sendTextMessage(senderID, messagesText.stdIdErr[value.language])
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
        send.sendTextMessage(senderID, messagesText.willSendInfo[value.language] + messageText + messagesText.tellGetKey[value.language])
      } else if (value.menu === 'regPersonnel') {
        send.sendTextMessage(senderID, messagesText.emailErr[value.language])
            // /////////////////////////////////// waitkey Register ////////////////////////////////////////// //
      } else if (value.menu === 'waitTokenVerify') {
        firebaseDB.checkVerify(senderID, messageText)
            // ///////////////////////////////////  Message Text Say hi //////////////////////////////////////////
      } else {
        send.sendTextMessage(senderID, messagesText.noAnswer[value.language])
      }
    }).catch(error => console.error(error))
  }
}
// ///////////// receivedPostback //////////////////
const receivedPostback = (event) => {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp
  // var payload = event.postback.payload

  var {type, data} = JSON.parse(event.postback.payload)

  console.log('Received postback for user %d and page %d with payload type = %s data = %s' + 'at %d', senderID, recipientID, type, data, timeOfPostback)
  firebaseDB.checkUserData(senderID).then(value => {
    if (type === 'GET_STARTED') {
      firebaseDB.checkUserGetStart(senderID)
    } else if (type === 'student') {
      if (!value.verify) {
        firebaseDB.updateStateUser(senderID, 'register', 'regStudent')
        send.sendTextMessage(senderID, messagesText.inputstdID[value.language])
      } else {
        send.sendTextMessage(senderID, messagesText.blockRegSuccess[value.language])
      }
    } else if (type === 'personnel') {
      if (!value.verify) {
        firebaseDB.updateStateUser(senderID, 'register', 'regPersonnel')
        send.sendTextMessage(senderID, messagesText.reqtecherEmail[value.language])
      } else {
        send.sendTextMessage(senderID, messagesText.blockRegSuccess[value.language])
      }
    } else if (type === 'cancleBooking') {
      firebaseDB.deleteBookingDB(`booking/${data}`)
      send.sendTextMessage(senderID, messagesText.cancleOrder[value.language])
    } else if (type === 'selectBooking') {
      if (value.verify) {
        send.selectBookingMenu(senderID, value.language)
      } else {
        send.sendTextMessage(senderID, messagesText.pleaseRegister[value.language])
      }
    } else if (type === 'changeLanguage') {
      send.selectLanguage(senderID)
    } else if (type === 'selectLanguage') {
      firebaseDB.swapLanguage(senderID, data)
      send.sendTextMessage(senderID, messagesText.selectLanguage[data])
    }
  })
}
const compareMessageText = (message, allPattern) => {
  console.log('go to compare')
  return allPattern.some(pattern => {
    return pattern === message
  })
}
module.exports = {
  receivedMessage,
  receivedPostback
}
