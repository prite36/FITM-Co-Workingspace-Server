// ////////////////////////////////// require ////////////////////////////////////////////////
const firebase = require('firebase')
const momenTime = require('moment-timezone')
// ////////////////// Import DATA  //////////////////
const send = require('./send')
const messagesText = require('./messagesText')
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
      send.sendTextMessage(senderID, messagesText.sendRegSuccess[value.language])
      send.selectBookingMenu(senderID, value.language)
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
      pushProfileData(senderID, value.status, value.data)
      send.sendTextMessage(senderID, messagesText.sendRegSuccess[value.language])
      send.selectBookingMenu(senderID, value.language)
    } else {
      send.sendTextMessage(senderID, messagesText.tokenErr[value.language])
    }
  })
}
const getBookingdata = () => {
  return new Promise((resolve, reject) => {
    db.ref('booking/').once('value', snapshot => {
      resolve(snapshot.val())
    })
  })
}

const deleteBookingDB = (childPart) => {
  console.log(`deleteBookingDB : ${childPart}`)
  db.ref(childPart).remove()
}

function writeDefaultData (senderID) {
  db.ref('state/').child(senderID).set({
    menu: '',
    status: '',
    verify: false,
    language: 'th',
    timestamp: momenTime().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')
  })
}
const swapLanguage = (senderID, language) => {
  db.ref('state/').child(senderID).update({
    language: language
  })
}

function pushProfileData (senderID, status, profileData) {
  let p1 = new Promise((resolve, reject) => {
    resolve(db.ref('profile/').child(status).child(senderID).set(profileData))
  })
  p1.then(db.ref('state/').child(senderID).child('data').remove())
}
module.exports = {
  db,
  updateStateUser,
  checkUserData,
  checkUserGetStart,
  checkVerify,
  getBookingdata,
  deleteBookingDB,
  swapLanguage
}
