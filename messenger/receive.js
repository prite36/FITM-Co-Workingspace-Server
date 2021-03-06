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
  console.log('Received message for user %d and page %d at %d with message:', senderID, recipientID, timeOfMessage)
  // var messageId = message.mid
  var messageText = message.text
  if (messageText) {
    firebaseDB.checkUserData(senderID).then(value => {
      // simlple message
      let textTolowerCase = messageText.toLowerCase()
      if (textTolowerCase === 'hello') {
        send.sendTextMessage(senderID, messagesText.sayHello['eng'])
      } else if (textTolowerCase === 'สวัสดี') {
        send.sendTextMessage(senderID, messagesText.sayHello['th'])
      } else if (compareMessageText(textTolowerCase, ['register', 'reg', 'regis', 'l,y8i', 'l,y8il,k=bd', 'สมัครสมาชิก', 'สมัคร'])) {
        if (!value.verify) {
          send.registerMenu(senderID, value.language)
        } else {
          send.sendTextMessage(senderID, messagesText.blockRegSuccess[value.language])
        }
      } else if (compareMessageText(textTolowerCase, ['information', 'info', '-hv,^]', 'ข้อมูล'])) {
        send.sendTextMessage(senderID, messagesText.information[value.language])
      } else if (compareMessageText(textTolowerCase, ['menu', 'manu', 'g,o^]', 'เมนู'])) {
        send.sendTextMessage(senderID, messagesText.menu[value.language])
      } else if (compareMessageText(textTolowerCase, ['editprofile', 'cdhw--hv,^]', 'แก้ไขโปรไฟล์', 'แก้ไขโปรไฟล'])) {
        firebaseDB.checkGuestProfile(senderID).then(check => {
          if (check) {
            send.editProfile(senderID, value.language)
          } else {
            send.sendTextMessage(senderID, messagesText.rejectEditPRofile[value.language])
          }
        })
      } else if (textTolowerCase === 'test1') {
        send.startUseMeetRoom(senderID, 'Room1', '5648', value.language)
      } else if (value.menu === 'regStudent' && /57\d{11}/.test(messageText)) {
        // Student Register
        console.log('Go to Register student' + messageText)
        const emailStudent = 's' + messageText + '@email.kmutnb.ac.th'
        let updateData = {
          data: {
            email: emailStudent,
            countOfNotCheckIn: 0,
            statusBlock: false
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
      } else if (value.menu === 'regStaff') {
        // staff Register
        // เช็คใน DB ว่าใช้ Email ของอาจารย์หรือไม่
        firebaseDB.checkStaffEmail(messageText).then(snapshot => {
          console.log('Go to Register Staff' + snapshot.email)
          let updateData = {
            data: {
              email: snapshot.email,
              engname: snapshot.engname,
              thname: snapshot.thname,
              countOfNotCheckIn: 0,
              statusBlock: false
            },
            status: 'staff'
          }
          firebaseDB.updateStateUser(senderID, 'updateData', updateData)
          let updateToken = send.sendEmail(senderID, snapshot.email)
          firebaseDB.updateStateUser(senderID, 'SendEmail', updateToken)
          send.sendTextMessage(senderID, messagesText.willSendInfo[value.language] + snapshot.email + messagesText.tellGetKey[value.language])
        }).catch(() => {
          // ส่งข้อความว่า Email ไม่ถูกต้อง
          send.sendTextMessage(senderID, messagesText.emailErr[value.language])
        })
      } else if (value.menu === 'waitTokenVerify') {
        //  waitkey Register
        firebaseDB.checkVerify(senderID, messageText)
      } else {
        //  Message Text No Answer
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
  console.log(event.postback.payload)
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
    } else if (type === 'staff') {
      if (!value.verify) {
        firebaseDB.updateStateUser(senderID, 'register', 'regStaff')
        send.sendTextMessage(senderID, messagesText.reqtecherEmail[value.language])
      } else {
        send.sendTextMessage(senderID, messagesText.blockRegSuccess[value.language])
      }
    } else if (type === 'cancleBooking') {
      firebaseDB.checkIDBooking(data).then(check => {
        if (check) {
          firebaseDB.bookingToHistory(data, 'cancleBooking')
        } else {
          send.sendTextMessage(senderID, messagesText.rejectCancleBooking[value.language])
        }
      })
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
  return allPattern.some(pattern => {
    return pattern === message
  })
}
module.exports = {
  receivedMessage,
  receivedPostback
}
