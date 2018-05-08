// ////////////////////////////////// require ////////////////////////////////////////////////
const firebase = require('firebase')
const momenTime = require('moment-timezone')
const moment = require('moment')
// ////////////////// Import DATA  //////////////////
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
const checkRoomPassword = (data) => {
  var typeItem = data.typeItem
  var nameTypeItem = data.nameTypeItem
  var getPassword = data.password
  var logToBooking = (childPart, status) => {
    db.ref('booking/').child(childPart).child('logCheckIn').push({
      ststus: status,
      timestamp: momenTime().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')
    })
  }
  db.ref('booking/').child('meetingRoom').child(typeItem).child(nameTypeItem).once('value', snapshot => {
    let answer = Object.values(snapshot.val()).find(element => {
      let timeTH = momenTime().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')
      let checkBetween = moment(timeTH).isBetween(`${element.dateStart} ${element.timeStart}`, `${element.dateStop} ${element.timeStop}`, null, '[]')
      return checkBetween
    })
    // ถ้ามี booking ที่อยู่ระหว่างเวลาปัจจุบัน
    if (answer) {
      let checkPassword = Number.parseInt(answer.roomPassword) === Number.parseInt(getPassword)
      // ถ้า password ถูกต้อง เปลี่ยน status และเก็บ log ใน Booking นั้น
      if (checkPassword) {
        db.ref('booking/').child(answer.childPart).update({
          status: 'checkIn'
        })
        logToBooking(answer.childPart, 'accept')
        return ('accept')
      } else {
        // ถ้าใส่รหัสผิด
        logToBooking(answer.childPart, 'reject')
        return ('reject')
      }
    } else {
      console.log('test' + typeItem)
      //  ถ้าไม่มี booking ที่อยู่ระหว่างเวลาปัจจุบัน
      db.ref('logRooms/').push({
        typeItem: typeItem,
        nameTypeItem: nameTypeItem,
        ststus: 'reject',
        timestamp: momenTime().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')
      })
      return ('reject')
    }
  })
}
module.exports = {
  checkRoomPassword
}
