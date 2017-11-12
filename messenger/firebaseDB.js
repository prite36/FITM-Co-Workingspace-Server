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
const updateStateUser = (senderID, menu, text) => {
  if (menu === 'register') {
    db.ref('state/').child(senderID).update({
      menu: text
    })
  } else if (menu === 'SendEmail') {
    db.ref('state/').child(senderID).update({
      menu: text.menu,
      token: text.token
    })
    // เงื่อนไข เก็บข้อมูลผู้ใช้เบื้องต้น ถ้า verifire ผ่าน จะเอาไปเก็บใน profile
  } else if (menu === 'updateData') {
    db.ref('state/').child(senderID).update(text)
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
      updateStateUser(senderID, 'verify', true)
      send.sendTextMessage(senderID, 'สมัครสมาชิกเรียบร้อย')
      pushProfileData(senderID, value.status, value.data)
    } else {
      send.sendTextMessage(senderID, 'Tokenไม่ถูกต้อง กรุณาใส่ใหม่')
    }
  })
}
function writeDefaultData (senderID) {
  db.ref('state/').child(senderID).set({
    menu: '',
    status: '',
    verify: false,
    timestamp: new Date().toString()
  })
}
function pushProfileData (senderID, status, profileData) {
  db.ref('profile/').child(status).child(senderID).set(profileData)
}

module.exports = {
  db,
  updateStateUser,
  checkUserData,
  checkUserGetStart,
  checkVerify
}
