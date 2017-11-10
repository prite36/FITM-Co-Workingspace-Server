var express = require('express')
var router = express.Router()
// ////////////////// Import DATA  //////////////////
const receive = require('./receive')

router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

router.post('/webhook/', function (req, res) {
  var data = req.body
  data.entry.forEach(function (entry) {
    entry.messaging.forEach(function (event) {
      console.log('test' + JSON.stringify(event))
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

module.expotrs = {
  router
}
