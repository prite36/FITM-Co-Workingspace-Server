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
const checkStaffEmail = (email) => {
  // เช็ค Email ของ อาจารย์
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
      if (value.status === 'guest') {
        send.editProfile(senderID, value.language)
      }
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
const getConfigSystem = () => {
  return new Promise((resolve, reject) => {
    db.ref('configSystem/').once('value', snapshot => {
      resolve(snapshot.val())
    })
  })
}
const startUse = (senderID, childPart) => {
  let splitData = childPart.split('/')
  let typeItem = splitData[0]
  let nameTypeItem = splitData[2]
  // random รหัส 4 หลัก โดยการ  random 5-digit แล้วทำเป็น string แล้ว ลบหลักแรกออก
  let password = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
  db.ref('booking/').child(childPart).update({roomPassword: password})
  checkUserData(senderID).then(values => {
    if (typeItem === 'device') {
      send.sendTextMessage(senderID, messagesText.startUseDevice(nameTypeItem, values.language))
    } else if (typeItem === 'meetingRoom') {
      send.startUseMeetRoom(senderID, nameTypeItem, password, values.language)
    }
  })
}
const bookingToHistory = (childPart, action) => {
  let booking = (childPart) => {
    // ดึงค่าของการจองครั้งนั้น
    return new Promise(resolve => {
      db.ref(childPart).once('value', snapshot => {
        bookingData = snapshot.val()
        resolve(snapshot.val())
      })
    })
  }
  let countOfBlock = new Promise(resolve => {
    // ดึงค่า countOfBlock (user ไม่ check-in กี่ครั้ง ถึงจะโดน BLock)จาก configSystem
    db.ref('configSystem/').child('countOfBlock').child('value').once('value', snapshot => { resolve(snapshot.val()) })
  })
  let userProfiles = (status, senderID) => {
    // ดึง Pro file ของ USer คนนั้นออกมา
    return new Promise(resolve => {
      db.ref('profile/').child(status).child(senderID).once('value', snapshot => { resolve(snapshot.val()) })
    })
  }
  var typeItem = childPart.substr(0, childPart.indexOf('/'))
  var changeProfileData = {}
  var bookingData = {}
  booking(`booking/${childPart}`).then(values1 => {
    if (action === 'notCheckIn') {
      // ถ้าอยู่ในสถานะ pending คือยังไม่ได้ check-in  และไม่ใช่ Booking ประเภท device
      if (values1.status === 'pending' && typeItem !== 'device') {
        checkUserData(values1.senderID).then(values2 => {
          Promise.all([userProfiles(values2.status, values1.senderID), countOfBlock]).then(values3 => {
            // แก้ status pending เป็น notCheckIn
            bookingData.status = 'notCheckIn'
            send.sendTextMessage(values1.senderID, messagesText.notCheckIn[values2.language])
            /* ถ้า countOfNotCheckIn >= countOfBlock
               หมายความว่าถ้าประวัติ User ไม่ได้ check-in จนครบกำหนดจะ Block User คนนี้
            */
            if (values3[0].countOfNotCheckIn >= (values3[1] - 1)) {
              // โดน BLock
              console.log(`senderID : ${values1.senderID} is blocked `)
              changeProfileData.statusBlock = true
              send.sendTextMessage(values1.senderID, messagesText.blockUser[values2.language])
            }
            //  เก็บประวัติ countOfNotCheckIn บวกเพิ่มไป 1
            changeProfileData.countOfNotCheckIn = values3[0].countOfNotCheckIn + 1
            console.log(`senderID : ${values1.senderID} is Not Check-In `)
            // แก้ไข Profile ใน DB
            db.ref('profile/').child(values2.status).child(values1.senderID).update(changeProfileData)
          })
        })
      }
    } else if (action === 'cancleBooking') {
      bookingData.status = 'userCancleBooking'
      checkUserData(values1.senderID).then(values => {
        send.sendTextMessage(values1.senderID, messagesText.cancleOrder[values.language])
      })
    } else if (action === 'endBooking') {
      bookingData.status = 'endBooking'
      checkUserData(values1.senderID).then(values => {
        send.sendTextMessage(values1.senderID, messagesText.endBooking[values.language])
      })
    }
    // เก็บประวัติการจองลง history
    db.ref('history/').push(bookingData).then(
      //  ลบการจองใน booking
      db.ref(`booking/${childPart}`).remove()
    )
  })
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
  getConfigSystem,
  startUse,
  bookingToHistory,
  swapLanguage
}
