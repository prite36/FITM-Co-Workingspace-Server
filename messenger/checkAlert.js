// ////////////////////////////////// require ////////////////////////////////////////////////
const moment = require('moment')
const momenTime = require('moment-timezone')
// ////////////////// Import DATA  //////////////////
const send = require('./send')
// const messagesText = require('./messagesText')
const firebaseDB = require('./firebaseDB')

const checkAlertTimeAllBooking = () => {
  firebaseDB.getBookingdata().then(value => {
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

function checkAlertTime (senderID, timeStart, timeStop, childPart) {
  let format = 'YYYY-MM-DD HH:mm'
  let loopCheck = [
    { timeCheck: timeStart, subtractTime: 30 },
    { timeCheck: timeStart, subtractTime: 5 },
    { timeCheck: timeStop, subtractTime: 10 },
    { timeCheck: timeStop, subtractTime: 0 }
  ]
  loopCheck.forEach(value => {
    // เอาเวลาจองลบออกไป  ตามตัวแปร subtractTime หน่วยนาที
    const timeCheck = moment(value.timeCheck, format).subtract(value.subtractTime, 'm')
    const timeNow = moment(momenTime().tz('Asia/Bangkok').format(format), format)
    // เวลาจองอยู่ห่างจากเวลาปัจจุบันกี่วินาที
    let timeDiff = timeCheck.diff(timeNow, 's')
    // เวลาจองอยู่ก่อน เวลาปัจจบันรึเปล่า ถ้าใช่คืนค่า true และเวลาห่างกัน < 120 วินาที  ( 2 นาท ี
    if (timeCheck.isSameOrAfter(timeNow) && (timeDiff < 120)) {
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
module.exports = {
  checkAlertTimeAllBooking
}
