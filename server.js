'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
require('dotenv').config({path: __dirname + '/.env'})
// ////////////////// Import ROUTES  //////////////////
const webhook = require('./routes/webhook')
const RESTfulAPI = require('./routes/RESTfulAPI')
// //////////////////////////////////////////////////////////////////////////////////
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use('/webhook', webhook)
app.use('/', RESTfulAPI)
app.set('port', (process.env.PORT || 5000))
app.get('/', function (req, res) {
  res.send('Server OK')
})
app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
