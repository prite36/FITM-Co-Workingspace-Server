const express = require('express')
const router = express.Router()
const momenTime = require('moment-timezone')
// ////////////////// Import DATA  //////////////////
const firebaseDB = require('../messenger/firebaseDB')
const send = require('../messenger/send')
const checkAlert = require('../messenger/checkAlert')

router.post('/externalregister', function (req, res) {
  let data = req.body.body
  let updateData = {
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      birtday: data.birtday,
      gender: data.gender
    },
    status: 'person'
  }
  firebaseDB.updateStateUser(data.senderID, 'updateData', updateData)
  let updateToken = send.sendEmail(data.senderID, data.email)
  firebaseDB.updateStateUser(data.senderID, 'SendEmail', updateToken)
  send.sendTextMessage(data.senderID, 'เราจะส่งข้อมูลของคุณไปที่ ' + data.email + '\nสามารถนำ key มาสมัครในเเชท')
  //  ถ้าสมัครสำเร็จให้ส่งกลับไปว่า success
  res.send('success')
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
