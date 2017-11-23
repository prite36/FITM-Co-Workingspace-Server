// ////////////////////////////////// require ////////////////////////////////////////////////
const firebase = require('firebase')
const moment = require('moment')
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
  })
  checkUserData(senderID).then(value => {
    if (value !== null && value.verify) {
      send.sendTextMessage(senderID, messagesText.sendRegSuccess[value.language])
      send.selectBookingMenu(senderID, value.language)
    } else {
      console.log('message ' + senderID + ' null')
      send.registerMenu(senderID, value.language)
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
const checkAlertTimeAllBooking = () => {
  getBookingdata().then(value => {
    for (var key1 in value) {
      for (var key2 in value[key1]) {
        for (var key3 in value[key1][key2]) {
          for (var key4 in value[key1][key2][key3]) {
            let data = value[key1][key2][key3][key4]
            let childPart = `/booking:${key1}:${key2}:${key3}:${key4}`
            checkAlertTime(data.senderID, `${data.dateStart} ${data.timeStart}`, `${data.dateStop} ${data.timeStop}`, childPart)
          }
        }
      }
    }
  })
}
const deleteBookingDb = (childPart) => {
  console.log(`deleteBookingDb= ${childPart}`)
  db.ref(childPart).remove()
}
function checkAlertTime (senderID, timeStart, timeStop, childPart) {
  let format = 'YYYY-MM-DD HH:mm'
  let loopCheck = [
    { timeCheck: timeStart, subtractTime: 30 },
    { timeCheck: timeStart, subtractTime: 5 },
    { timeCheck: timeStop, subtractTime: 10 },
    { timeCheck: timeStop, subtractTime: 0 }
  ]
  loopCheck.forEach(value => {
    const timeCheck = moment(value.timeCheck, format).subtract(value.subtractTime, 'm')
    const timeNow = moment(momenTime().tz('Asia/Bangkok').format(format), format)
    // เวลาจองอยู่ห่างจากเวลาปัจจุบันกี่วินาที
    let timeDiff = timeCheck.diff(timeNow, 's')
    // เวลาจองอยู่ก่อน เวลาปัจจบันรึเปล่า ถ้าใช่คืนค่า true และเวลาห่างกัน <= 120 วินาที  ( 2 นาท ี
    if (timeCheck.isSameOrAfter(timeNow) && (timeDiff <= 120)) {
      console.log(`SenderID ${senderID} Alert in ${timeDiff} s`)
      setTimeout(() => {
        alertToUser(senderID, value.subtractTime, childPart)
      }, (timeDiff * 1000))
    }
  })
}
function alertToUser (senderID, time, childPart) {
  if (time === 30 || time === 5) {
    send.sendTextMessage(senderID, `อีก ${time} นาที จะถึงเวลาจองของคุณ`)
  } else if (time === 10) {
    send.menuChangeTime(senderID, childPart)
  } else {
    send.sendTextMessage(senderID, `หมดเวลาจองของคุณแล้ว ขอบคุณที่ใช้บริการ`)
  }
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
  db.ref('profile/').child(status).child(senderID).set(profileData)
}
module.exports = {
  db,
  updateStateUser,
  checkUserData,
  checkUserGetStart,
  checkVerify,
  checkAlertTimeAllBooking,
  deleteBookingDb,
  swapLanguage
}
