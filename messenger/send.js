const request = require('request')
const sgMail = require('@sendgrid/mail')
// ////////////////// Import DATA  //////////////////
const message = require('./messages')
const firebaseDB = require('./firebaseDB')
console.log('test1' + firebaseDB)
const sendTextMessage = (recipientId, messageText) => {
  console.log('Go to Sent Message')
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
const sendEmail = (senderID, email) => {
  console.log('Go to Sent Email')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  let token = randomToken()
  let data = {
    menu: 'waitTokenVerify',
    token: token
  }
  const msg = {
    to: email,
    from: process.env.EMAIL_SENDER,
    subject: 'Co-Workingspace Verify Token',
    text: 'ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + token,
    html: '<strong>ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + token + '</strong>'
  }
  sgMail.send(msg)
  // ส่งค่าไปเพื่อ update state
  return data
}
const registerMenu = (recipientId) => {
  callSendAPI(message.messageChangeStatus(recipientId))
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
function randomToken () {
  let mask = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (var i = 5; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))]
  return result
}

module.exports = {
  sendTextMessage,
  sendEmail,
  registerMenu
}
