const express = require('express')
const router = express.Router()
// ////////////////// Import DATA  //////////////////
const firebaseDB = require('../messenger/firebaseDB')
const send = require('../messenger/send')

router.post('/externalregister', function (req, res) {
  let data = req.body
  console.log(req.body.body.firstName)
  let updateData = {
    data: {
      firstName: data.body.firstName,
      lastName: data.body.lastName,
      email: data.body.email,
      phoneNumber: data.body.phoneNumber,
      birtday: data.body.birtday,
      gender: data.body.gender
    },
    status: 'person'
  }
  firebaseDB.updateStateUser(data.body.senderID, 'updateData', updateData)
  let updateToken = send.sendEmail(data.body.senderID, data.body.email)
  firebaseDB.updateStateUser(data.body.senderID, 'SendEmail', updateToken)
  send.sendTextMessage(data.body.senderID, 'เราจะส่งข้อมูลของคุณไปที่ ' + data.body.email + '\nสามารถนำ key มาสมัครในเเชท')
  //  ถ้าสมัครสำเร็จให้ส่งกลับไปว่า success
  res.send('success')
})

module.exports = router
