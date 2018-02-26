const request = require('request')
const sgMail = require('@sendgrid/mail')
// ////////////////// Import DATA  //////////////////
const message = require('./messages')
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
  callSendAPI('messages', messageData)
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
const registerMenu = (recipientId, language) => {
  callSendAPI('messages', message.registerMenu(recipientId, language))
}
const blockRegSuccess = (recipientId) => {
  callSendAPI('messages', message.blockRegSuccess(recipientId))
}
const selectBookingMenu = (recipientId, language) => {
  callSendAPI('messages', message.selectBookingMenu(recipientId, language))
}
const menuChangeTime = (recipientId, language, childPart) => {
  callSendAPI('messages', message.menuChangeTime(recipientId, language, childPart))
}
const bookingSuccess = (data, language) => {
  callSendAPI('messages', message.bookingSuccess(data, language))
}
const selectLanguage = (recipientId) => {
  callSendAPI('messages', message.selectLanguage(recipientId))
}
const editProfile = (recipientId, language) => {
  console.log('come1')
  callSendAPI('messages', message.editProfile(recipientId, language))
}
const callSendAPI = (endPoint, messageData) => {
  request({
    uri: `https://graph.facebook.com/v2.6/me/${endPoint}`,
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
  registerMenu,
  blockRegSuccess,
  selectBookingMenu,
  callSendAPI,
  menuChangeTime,
  bookingSuccess,
  selectLanguage,
  editProfile
}
