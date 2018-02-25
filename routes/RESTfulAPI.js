const express = require('express')
const router = express.Router()
const momenTime = require('moment-timezone')
// ////////////////// Import DATA  //////////////////
const firebaseDB = require('../messenger/firebaseDB')
const send = require('../messenger/send')
const checkAlert = require('../messenger/checkAlert')
const messagesText = require('../messenger/messagesText')

router.post('/externalregister', function (req, res) {
  let data = req.body.body
  let senderID = data.senderID
  let email = data.email
  let updateData = {
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender
    },
    status: 'guest'
  }
  firebaseDB.updateStateUser(data.senderID, 'updateData', updateData)
  let updateToken = send.sendEmail(data.senderID, data.email)
  firebaseDB.updateStateUser(data.senderID, 'SendEmail', updateToken)
  firebaseDB.checkUserData(senderID).then(value => {
    send.sendTextMessage(senderID, messagesText.willSendInfo[value.language] + email + messagesText.tellGetKey[value.language])
  })
  //  ถ้าสมัครสำเร็จให้ส่งกลับไปว่า success
  res.send('success')
})

router.post('/editProfile', function (req, res) {
  let senderID = req.body.body.senderID
  firebaseDB.checkUserData(senderID).then(value => {
    send.sendTextMessage(senderID, messagesText.editProfileSuccess[value.language])
  })
})
router.post('/bookingSuccess', function (req, res) {
  let data = req.body.body
  firebaseDB.checkUserData(data.senderID).then(value => {
    send.bookingSuccess(data, value.language)
  })
  res.send('success')
})

router.post('/rebookingSuccess', function (req, res) {
  let data = req.body.body
  console.log(data)
  send.sendTextMessage(data.senderID, `คุณได้เปลี่ยนเวลาจอง โดยจะหมดเวลา วันที่ ${data.date} เวลา ${data.time}`)
  res.send('success')
})

router.post('/alert', function (req, res) {
  console.log('Check Alert Time ')
  console.log('Time now ' + momenTime().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm'))
  checkAlert.checkAlertTimeAllBooking()
  res.send('checkNow')
})

module.exports = router
