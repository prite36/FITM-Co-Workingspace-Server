
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
    // var pageID = entry.id
    // var timeOfEvent = entry.time
    // Iterate over each messaging event
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
  var messageAttachments = message.attachments
  if (messageText) {
    checkUserMenu(senderID).then(value => {
      if (value === 'regStu' && /57\d{11}/.test(messageText)) {
        sendEmail(messageText)
        sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที่ ' + messageText + '@fitm.kmutnb.ac.th\nสามารถนำ key มาสมัครในเเชท')
      } else {
        sendTextMessage(senderID, 'รหัสนักศึกษาไม่ถูกต้อง กรุณาพิมพ์ใหม่')
      }
      if (value === 'waitKey') {
        checkVerify(senderID, messageText)
      }
      if (messageText === 'register') {
        registerMenu(senderID)
      } else if (value === '') {
        sendTextMessage(senderID, 'กรุณาพิมพ์ register เพื่อสมัครใช้งาน')
      } else if (messageAttachments) {
        sendTextMessage(senderID, 'Message with attachment received')
      }
    })
  }
}

function receivedPostback (event) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload
  console.log('Received postback for user %d and page %d with payload %s ' +
    'at %d', senderID, recipientID, payload, timeOfPostback)
  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  if (payload.includes('GET_STARTED')) {
    checkUserGetStart(senderID)
  } else if (payload === 'student') {
    updataStateUser(senderID, 'register', 'regStudent')
    sendTextMessage(senderID, 'กรุณากรอกรหัสนักศึกษา 13 หลัก เพื่อรับการยืนยันตัวตนทาง email')
  } else if (payload === 'personnel') {
    updataStateUser(senderID, 'register', 'regPersonnel')
    sendTextMessage(senderID, 'personnel')
  } else if (payload === 'person') {
    updataStateUser(senderID, 'register', 'regPerson')
    sendTextMessage(senderID, 'person')
  } else if (payload === 'getdata') {
    db.ref('users/').on('value', function (snapshot) {
      // sendTextMessage(senderID, snapshot.val())
      console.log('Get data ' + snapshot.val())
    })
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
function sendEmail (senderID, studentId) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  let tokenStudent = jwt.sign(studentId, 'Co-Workingspace')
  const msg = {
    to: studentId + '@fitm.kmutnb.ac.th',
    from: process.env.EMAIL_SENDER,
    subject: 'Co-Workingspace Verify Token',
    text: 'ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + tokenStudent,
    html: '<strong>ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + tokenStudent + '</strong>'
  }
  sgMail.send(msg)
  updataStateUser(senderID, 'SendEmail', 'waitKey')
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
  } else if (menu === 'studentID') {
    db.ref('users/').child(senderID).update({
      studentID: text
    })
  } else if (menu === 'verify') {
    db.ref('users/').child(senderID).update({
      verify: text
    })
  }
}
function checkUserMenu (senderID) {
  return new Promise((resolve, reject) => {
    db.ref('users/' + senderID).once('value', snapshot => {
      resolve(snapshot.val().menu)
    })
  })
}
function checkUserGetStart (senderID) {
  db.ref('users/').child(senderID).on('value', function (snapshot) {
    if (snapshot.val() == null) {
      writeDefaultData(senderID)
    }
    if (snapshot.val() !== null && snapshot.val().verify) {
      sendTextMessage(senderID, 'รอจองห้องประชุม')
    } else {
      console.log('message ' + senderID + ' null')
      registerMenu(senderID)
    }
  })
}
function checkVerify (senderID, tokenStudent) {
  jwt.verify(tokenStudent, 'Co-Workingspace', function (err, decoded) {
    if (err) console.log(err)
    if (decoded) {
      db.ref('users/').child(senderID).on('value', function (snapshot) {
        if (snapshot.val().studentID === decoded) {
          updataStateUser(senderID, 'verify', true)
        } else {
          sendTextMessage(senderID, 'Tokenไม่ถูกต้อง กรุณาใส่ใหม่')
        }
      })
    }
  })
}
function writeDefaultData (senderID) {
  db.ref('users/').child(senderID).set({
    menu: '',
    studentID: '',
    verify: false,
    timestamp: new Date().toString()
  })
}

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
