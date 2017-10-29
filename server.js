
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const sgMail = require('@sendgrid/mail')
var jwt = require('jsonwebtoken')
const app = express()
var checkstate = 0
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
      console.log('test'+event)
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
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    if (/57\d{11}/.test(messageText) && checkstate === 2) {
      sendEmail(messageText)
      sendTextMessage(senderID, 'เราจะส่งข้อมูลของคุณไปที่ '+messageText+'@fitm.kmutnb.ac.th\nสามารถนำ key มาสมัครในเเชท')
    }
    else {
      sendTextMessage(senderID, 'รหัสนักศึกษาไม่ถูกต้อง กรุณาพิมพ์ใหม่')
    }
    if (messageText  === 'register') {
      changeStatusRegister(senderID)
      checkstate = 1
    }
    else if (checkstate === 0) {
      sendTextMessage(senderID, 'กรุณาพิมพ์ register เพื่อสมัครใช้งาน')
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received')
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
  if (checkstate === 1) {
    if (payload === 'student') {
      sendTextMessage(senderID, 'กรุณากรอกรหัสนักศึกษา 13 หลัก เพื่อรับการยืนยันตัวตนทาง email')
      checkstate = 2
    } else if (payload === 'personnel') {
      sendTextMessage(senderID, 'personnel')
    } else if (payload === 'person') {
      sendTextMessage(senderID, 'person')
    }
  } else if (checkstate === 0) {
    sendTextMessage(senderID, 'กรุณาพิมพ์ register เพื่อสมัครใช้งาน')
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
function changeStatusRegister (recipientId) {
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
  });
}
function sendEmail (studentId) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  let token_student = jwt.sign(studentId, 'Co-Workingspace')
  const msg = {
    to: studentId + '@fitm.kmutnb.ac.th',
    from: process.env.EMAIL_SENDER,
    subject: 'Co-Workingspace Verify Token',
    text: 'ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + token_student,
    html: '<strong>ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + token_student+'</strong>'
  }
  sgMail.send(msg)
  checkstate = 0
}
app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
