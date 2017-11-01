
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const sgMail = require('@sendgrid/mail')
var jwt = require('jsonwebtoken')
const app = express()
var firebase = require('firebase')
  // Initialize Firebase
var config = {
  apiKey: 'AIzaSyAE2rQQye4hlRpDqAWirvyaaCExiaWA8DY',
  authDomain: 'fitm-coworkingspace.firebaseapp.com',
  databaseURL: 'https://fitm-coworkingspace.firebaseio.com',
  projectId: 'fitm-coworkingspace',
  storageBucket: 'fitm-coworkingspace.appspot.com',
  messagingSenderId: '181239315787'
}
firebase.initializeApp(config)
var db = firebase.database()
require('dotenv').config({path: __dirname + '/.env'})
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.send('test test')
})
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})
app.post('/webhook/', function (req, res) {
  var data = req.body
  data.entry.forEach(function (entry) {
    entry.messaging.forEach(function (event) {
      console.log('test' + JSON.stringify(event))
      if (event.message) {
        receivedMessage(event)
      } else if (event.postback) {
        receivedPostback(event)
      } else {
        console.log('Webhook received unknown event: ', event)
      }
    })
  })
  res.sendStatus(200)
})

function receivedMessage (event) {
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
    checkUserData(senderID).then(value => {
      // /////////////////////////////////// Student Register ////////////////////////////////////////// //
      if (value.menu === 'regStudent' && /57\d{11}/.test(messageText)) {
        console.log('Go to Register student' + messageText)
        var emailStudent = 's' + messageText + '@email.kmutnb.ac.th'
        updataStateUser(senderID, 'statusStudent', emailStudent)
        sendEmail(senderID, emailStudent)
        sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที่ s' + messageText + '@email.kmutnb.ac.th\nสามารถนำ key มาสมัครในเเชท')
      } else if (value.menu === 'regStudent') {
        sendTextMessage(senderID, 'รหัสนักศึกษาไม่ถูกต้อง กรุณาพิมพ์ใหม่')
      }
      // /////////////////////////////////// personnel Register ////////////////////////////////////////// //
      if (value.menu === 'regPersonnel' && /\w\.\w@email\.kmutnb\.ac\.th/.test(messageText)) {
        console.log('Go to Register Personnel' + messageText)
        updataStateUser(senderID, 'statusPersonnel', messageText)
        sendEmail(senderID, messageText)
        sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที messageText\nสามารถนำ key มาสมัครในเเชท')
      } else if (value.menu === 'regPersonnel') {
        sendTextMessage(senderID, 'อีเมลไม่ถูกต้อง กรุณาพิมพ์ใหม่')
      }
      // /////////////////////////////////// waitkey Register ////////////////////////////////////////// //
      if (value.menu === 'waitTokenVerify') {
        checkVerify(senderID, messageText)
      }
    })
  }
}
function receivedPostback (event) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp
  var payload = event.postback.payload
  console.log('Received postback for user %d and page %d with payload %s ' + 'at %d', senderID, recipientID, payload, timeOfPostback)
  if (payload.includes('GET_STARTED')) {
    checkUserGetStart(senderID)
  } else if (payload === 'student') {
    updataStateUser(senderID, 'register', 'regStudent')
    sendTextMessage(senderID, 'กรุณากรอกรหัสนักศึกษา 13 หลัก เพื่อรับการยืนยันตัวตนทาง email')
  } else if (payload === 'personnel') {
    updataStateUser(senderID, 'register', 'regPersonnel')
    sendTextMessage(senderID, 'กรุณากรอกอีเมลของมหาวิทยาลัย\nเพื่อยืนยันการสมัครสำหรับ\nการสมัครของอาจารย์ \nเช่น xxx@email.kmutnb.ac.th')
  }
}
function sendTextMessage (recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }
  callSendAPI(messageData)
}
function registerMenu (recipientId) {
  var messageChangeStatus = {
    recipient: {
      id: recipientId
    },

    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'คุณต้องการสมัครใช้งาน FITM Co-Workingspace ในสถานะใด',
            subtitle: 'which one do you like to use it?',
            buttons: [
              {
                type: 'postback',
                title: 'นักศึกษา',
                payload: 'student'
              },
              {
                type: 'postback',
                title: 'บุคคลากร',
                payload: 'personnel'
              },
              {
                type: 'postback',
                title: 'บุคคลทั่วไป',
                payload: 'person'
              }
            ]
          }]
        }
      }
    }
  }
  callSendAPI(messageChangeStatus)
}
function callSendAPI (messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var recipientId = body.recipient_id
      var messageId = body.message_id
      console.log('Successfully sent generic message with id %s to recipient %s',
        messageId, recipientId)
    } else {
      console.error('Unable to send message.')
      console.error(response)
      console.error(error)
    }
  })
}
function sendEmail (senderID, email) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  let tokenStudent = jwt.sign(email, 'Co-Workingspace')
  const msg = {
    to: email,
    from: process.env.EMAIL_SENDER,
    subject: 'Co-Workingspace Verify Token',
    text: 'ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + tokenStudent,
    html: '<strong>ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + tokenStudent + '</strong>'
  }
  sgMail.send(msg)
  updataStateUser(senderID, 'SendEmail', 'waitTokenVerify')
}
function updataStateUser (senderID, menu, text) {
  if (menu === 'register') {
    db.ref('users/').child(senderID).update({
      menu: text
    })
  } else if (menu === 'SendEmail') {
    db.ref('users/').child(senderID).update({
      menu: text
    })
  } else if (menu === 'statusStudent') {
    db.ref('users/').child(senderID).update({
      email: text,
      status: 'student'
    })
  } else if (menu === 'statusPersonel') {
    db.ref('users/').child(senderID).update({
      email: text,
      status: 'personnel'
    })
  } else if (menu === 'verify') {
    db.ref('users/').child(senderID).update({
      verify: text
    })
  }
}
function checkUserData (senderID) {
  return new Promise((resolve, reject) => {
    db.ref('users/' + senderID).once('value', snapshot => {
      resolve(snapshot.val())
    })
  })
}
function checkUserGetStart (senderID) {
  checkUserData(senderID).then(value => {
    if (value === null) {
      writeDefaultData(senderID)
    }
    if (value !== null && value.verify) {
      sendTextMessage(senderID, 'รอจองห้องประชุม')
    } else {
      console.log('message ' + senderID + ' null')
      registerMenu(senderID)
    }
  })
}
function checkVerify (senderID, token) {
  jwt.verify(token, 'Co-Workingspace', (err, decoded) => {
    if (decoded) {
      checkUserData(senderID).then(value => {
        console.log('check Verify studentID=' + value.studentID + ' Decode=' + decoded)
        if ((value.status === 'student' && value.email === decoded) || (value.status === 'student' && value.email === decoded) || (value.status === 'student' && value.email === decoded)) {
          updataStateUser(senderID, 'verify', true)
          sendTextMessage(senderID, 'สมัครสมาชิกเรียบร้อย')
          pushProfileData(senderID, value.status, value.email)
        }
      })
    }
    if (err) {
      sendTextMessage(senderID, 'Tokenไม่ถูกต้อง กรุณาใส่ใหม่')
      console.log(err)
    }
  })
}
function writeDefaultData (senderID) {
  db.ref('users/').child(senderID).set({
    menu: '',
    status: '',
    email: '',
    emailguest: '',
    verify: false,
    timestamp: new Date().toString()
  })
}
function pushProfileData (senderID, status, email) {
  db.ref('profile/').child(status).child(senderID).set({
    email: email,
    status: status
  })
}
app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
