// ////////////////////////////////// Firebase ////////////////////////////////////////////////
const firebase = require('firebase')
// ////////////////// Import DATA  //////////////////
const send = require('./send')
var config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGEING_SENDER_ID
}
firebase.initializeApp(config)
const db = firebase.database()
const uptateStateUser = (senderID, menu, text) => {
  if (menu === 'register') {
    db.ref('state/').child(senderID).update({
      menu: text
    })
  } else if (menu === 'SendEmail') {
    db.ref('state/').child(senderID).update({
      menu: text.menu,
      token: text.token
    })
  } else if (menu === 'stateRegButton') {
    db.ref('state/').child(senderID).update({
      email: text.email,
      status: text.status
    })
  } else if (menu === 'verify') {
    db.ref('state/').child(senderID).update({
      verify: text
    })
  }
}
const checkUserData = (senderID) => {
  return new Promise((resolve, reject) => {
    db.ref('state/' + senderID).once('value', snapshot => {
      resolve(snapshot.val())
    })
  })
}
const checkUserGetStart = (senderID) => {
  checkUserData(senderID).then(value => {
    if (value === null) {
      writeDefaultData(senderID)
    }
    if (value !== null && value.verify) {
      send.sendTextMessage(senderID, 'รอจองห้องประชุม')
    } else {
      console.log('message ' + senderID + ' null')
      send.registerMenu(senderID)
    }
  })
}
const checkVerify = (senderID, token) => {
  checkUserData(senderID).then(value => {
    if (value.token === token) {
      firebase.updateStateUser(senderID, 'verify', true)
      send.sendTextMessage(senderID, 'สมัครสมาชิกเรียบร้อย')
      pushProfileData(senderID, value.status, value.email)
    } else {
      send.sendTextMessage(senderID, 'Tokenไม่ถูกต้อง กรุณาใส่ใหม่')
    }
  })
}
function writeDefaultData (senderID) {
  db.ref('state/').child(senderID).set({
    menu: '',
    status: '',
    email: '',
    token: '',
    verify: false,
    timestamp: new Date().toString()
  })
}
function pushProfileData (senderID, status, email) {
  db.ref('profile/').child(status).child(senderID).set({
    email: email,
    status: status
  })
}

module.exports = {
  db,
  uptateStateUser,
  checkUserData,
  checkUserGetStart,
  checkVerify
}
