// ////////////////////////////////// require ////////////////////////////////////////////////
const request = require('request')
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
      menu: '',
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
// เช็ค Email ของ อาจารย์
const checkStaffEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.ref('staff/').orderByChild('email').equalTo(email).once('value', snapshot => {
      if (snapshot.val()) {
        resolve()
      } else {
        reject() // eslint-disable-line
      }
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
      // ส่งข้อความต้อนรับ
      getLocale(senderID)
      .then((value) => {
        send.sendTextMessage(senderID, messagesText.welcomeToChatBot[value])
        send.registerMenu(senderID, value)
      })
    }
  })
}
const checkVerify = (senderID, token) => {
  checkUserData(senderID).then(value => {
    if (value.token === token) {
      updateStateUser(senderID, 'verify', true)
      pushProfileData(senderID, value.status, value.data)
      addFBLabel(senderID)
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
  getLocale(senderID)
  .then((value) => {
    db.ref('state/').child(senderID).set({
      menu: '',
      status: '',
      verify: false,
      language: value,
      timestamp: momenTime().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')
    })
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
function addFBLabel (senderID) {
  // เพิ่ม facebook Broadcast Messages Label เพื่อใช้ในการส่งข้อความเฉพาะ User ที่อยู่ใน Label
  let options = {
    url: `https://graph.facebook.com/v2.11/1902294086478661/label?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: {'user': senderID}
  }
  request(options, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      console.log(`Add PSID = ${senderID}  in Label Successful`)
    }
    if (err) {
      console.error(err)
    }
  })
}
// หา locale ภาษา ของ User คนนั้น ว่าใช้ภาษาอะไร
function getLocale (senderID) {
  let options = {
    url: `https://graph.facebook.com/v2.6/${senderID}?fields=locale&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  }
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (!err && response.statusCode === 200) {
        if (JSON.parse(body).locale === 'th_TH') {
          console.log(`${senderID} is Thai User`)
          resolve('th')
        } else {
          console.log(`${senderID} is Eng User`)
          resolve('eng')
        }
      }
      if (err) {
        console.error(err)
      }
    })
  })
}
module.exports = {
  db,
  updateStateUser,
  checkUserData,
  checkStaffEmail,
  checkUserGetStart,
  checkVerify,
  getBookingdata,
  deleteBookingDB,
  swapLanguage
}
