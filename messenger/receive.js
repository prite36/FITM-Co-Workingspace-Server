// ////////////////// Import DATA  //////////////////
const firebaseDB = require('./firebaseDB')
const send = require('./send')
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
        send.sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที่ s' + messageText + '@email.kmutnb.ac.th\nสามารถนำ key มาสมัครในเเชท')
      } else if (value.menu === 'regStudent') {
        send.sendTextMessage(senderID, 'รหัสนักศึกษาไม่ถูกต้อง กรุณาพิมพ์ใหม่')
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
        send.sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที messageText\nสามารถนำ key มาสมัครในเเชท')
      } else if (value.menu === 'regPersonnel') {
        send.sendTextMessage(senderID, 'อีเมลไม่ถูกต้อง กรุณาพิมพ์ใหม่')
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
  if (payload.includes('GET_STARTED')) {
    firebaseDB.checkUserGetStart(senderID)
  } else if (payload === 'student') {
    firebaseDB.updateStateUser(senderID, 'register', 'regStudent')
    send.sendTextMessage(senderID, 'กรุณากรอกรหัสนักศึกษา 13 หลัก เพื่อรับการยืนยันตัวตนทาง email')
  } else if (payload === 'personnel') {
    firebaseDB.updateStateUser(senderID, 'register', 'regPersonnel')
    send.sendTextMessage(senderID, 'กรุณากรอกอีเมลของมหาวิทยาลัย\nเพื่อยืนยันการสมัครสำหรับ\nการสมัครของอาจารย์ \nเช่น xxx@email.kmutnb.ac.th')
  } else if (payload === 'selectBooking') {
    send.selectBookingMenu(senderID)
  } else if (payload.type === 'cancleBooking') {
    firebaseDB.deleteBookingDb(payload.data.childPart)
  }
}

module.exports = {
  receivedMessage,
  receivedPostback
}
