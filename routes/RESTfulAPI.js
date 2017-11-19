const express = require('express')
const router = express.Router()
// ////////////////// Import DATA  //////////////////
const firebaseDB = require('../messenger/firebaseDB')
const send = require('../messenger/send')

router.post('/externalregister', function (req, res) {
  let data = req.body
  console.log(`Checkbody${req.body.body.firstName}`)
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

router.post('/booking', function (req, res) {
  let data = req.body
  let setChild = {
    item: data.body.item,
    typeItem: data.body.typeItem,
    senderID: data.body.senderID
  }
  let bookingData = {
    dateStart: data.body.dateStart,
    timeStart: data.body.timeStart,
    dateStop: data.body.dateStop,
    timeStop: data.body.timeStop,
    countPeople: data.body.countPeople
  }
  firebaseDB.pushBookingData(setChild, bookingData)
  res.send('recivebooking')
})

module.exports = router
