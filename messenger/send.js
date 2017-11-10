
const request = require('request')
const sgMail = require('@sendgrid/mail')
// ////////////////// Import DATA  //////////////////
const message = require('./messages')
const firebaseDB = require('./firebaseDB')

const sendTextMessage = (recipientId, messageText) => {
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
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  let token = randomToken()
  const msg = {
    to: email,
    from: process.env.EMAIL_SENDER,
    subject: 'Co-Workingspace Verify Token',
    text: 'ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + token,
    html: '<strong>ยืนยันการสมัครเรียบร้อย นี่คือ key ของคุณ\n' + token + '</strong>'
  }
  sgMail.send(msg)
  // update state waitTokenVerify and  Token
  firebaseDB.updateStateUser(senderID, 'SendEmail', {menu: 'waitTokenVerify', token: token})
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
