const express = require('express')
const router = express.Router()
const momenTime = require('moment-timezone')
// ////////////////// Import DATA  //////////////////
const firebaseDB = require('../messenger/firebaseDB')
const send = require('../messenger/send')

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
  send.sendTextMessage(data.senderID, `การจอง ${data.item} ของคุณเรียบร้อยแล้ว`)
  res.send('success')
})

module.exports = router
