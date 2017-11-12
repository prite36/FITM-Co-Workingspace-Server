'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
require('dotenv').config({path: __dirname + '/.env'})
// ////////////////// Import DATA  //////////////////
const webhook = require('./messenger/webhook')
const firebaseDB = require('./messenger/firebaseDB')
const send = require('./messenger/send')
// //////////////////////////////////////////////////////////////////////////////////
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// ////////////////////////////////////// Express ////////////////////////////////////////////
app.set('port', (process.env.PORT || 5000))

app.get('/', function (req, res) {
  res.send('Server OK')
})
app.use('/webhook', webhook)
app.post('/externalregister', function (req, res) {
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
})
// ////////////////////////////////////// FUNCTION ////////////////////////////////////////////

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
