const express = require('express')
const router = express.Router()
// ////////////////// Import DATA  //////////////////
const receive = require('./receive')

router.get('/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

router.post('/', function (req, res) {
  var data = req.body
  data.entry.forEach(function (entry) {
    entry.messaging.forEach(function (event) {
      if (event.message) {
        receive.receivedMessage(event)
      } else if (event.postback) {
        receive.receivedPostback(event)
      } else {
        console.log('Webhook received unknown event: ', event)
      }
    })
  })
  res.sendStatus(200)
})

module.exports = router
