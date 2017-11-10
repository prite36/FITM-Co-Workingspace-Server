// ////////////////// Import DATA  //////////////////
var firebaseDB = require('./firebaseDB')
const send = require('./send')

const receivedMessage = (event) => {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfMessage = event.timestamp
  var message = event.message
  console.log('Received message for user %d and page %d at %d with message:',
  senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))
  // var messageId = message.mid
  var messageText = message.text
  if (messageText) {
    firebaseDB.checkUserData(senderID).then(value => {
      // /////////////////////////////////// Student Register ////////////////////////////////////////// //
      if (value.menu === 'regStudent' && /57\d{11}/.test(messageText)) {
        console.log('Go to Register student' + messageText)
        var emailStudent = 's' + messageText + '@email.kmutnb.ac.th'
        firebaseDB.updateStateUser(senderID, 'stateRegButton', {email: emailStudent, status: 'student'})
        send.sendEmail(senderID, emailStudent)
        send.sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที่ s' + messageText + '@email.kmutnb.ac.th\nสามารถนำ key มาสมัครในเเชท')
      } else if (value.menu === 'regStudent') {
        send.sendTextMessage(senderID, 'รหัสนักศึกษาไม่ถูกต้อง กรุณาพิมพ์ใหม่')
      }
      // /////////////////////////////////// personnel Register ////////////////////////////////////////// //
      if (value.menu === 'regPersonnel' && /\w\.\w@email\.kmutnb\.ac\.th/.test(messageText)) {
        console.log('Go to Register Personnel' + messageText)
        firebaseDB.updateStateUser(senderID, 'stateRegButton', {email: messageText, status: 'personnel'})
        send.sendEmail(senderID, messageText)
        send.sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที messageText\nสามารถนำ key มาสมัครในเเชท')
      } else if (value.menu === 'regPersonnel') {
        send.sendTextMessage(senderID, 'อีเมลไม่ถูกต้อง กรุณาพิมพ์ใหม่')
      }
      // /////////////////////////////////// waitkey Register ////////////////////////////////////////// //
      if (value.menu === 'waitTokenVerify') {
        firebaseDB.checkVerify(senderID, messageText)
      }
    }).catch(error => console.log(error))
  }
}
const receivedPostback = (event) => {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp
  var payload = event.postback.payload
  console.log(payload)
  console.log('Received postback for user %d and page %d with payload %s ' + 'at %d', senderID, recipientID, payload, timeOfPostback)
  if (payload.includes('GET_STARTED')) {
    firebaseDB.checkUserGetStart(senderID)
  } else if (payload === 'student') {
    firebaseDB.updateStateUser(senderID, 'register', 'regStudent')
    send.sendTextMessage(senderID, 'กรุณากรอกรหัสนักศึกษา 13 หลัก เพื่อรับการยืนยันตัวตนทาง email')
  } else if (payload === 'personnel') {
    firebaseDB.updateStateUser(senderID, 'register', 'regPersonnel')
    send.sendTextMessage(senderID, 'กรุณากรอกอีเมลของมหาวิทยาลัย\nเพื่อยืนยันการสมัครสำหรับ\nการสมัครของอาจารย์ \nเช่น xxx@email.kmutnb.ac.th')
  }
}

module.exports = {
  receivedMessage,
  receivedPostback
}
