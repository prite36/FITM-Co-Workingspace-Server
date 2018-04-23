// ////////////////////////////////// require ////////////////////////////////////////////////
const moment = require('moment')
const momenTime = require('moment-timezone')
// ////////////////// Import DATA  //////////////////
const send = require('./send')
// const messagesText = require('./messagesText')
const firebaseDB = require('./firebaseDB')

const checkAlertTimeAllBooking = () => {
  firebaseDB.getConfigSystem().then(configSystem => {
    firebaseDB.getBookingdata().then(value => {
      for (var key1 in value) {
        for (var key2 in value[key1]) {
          for (var key3 in value[key1][key2]) {
            for (var key4 in value[key1][key2][key3]) {
              let data = value[key1][key2][key3][key4]
              let childPart = `${key1}:${key2}:${key3}:${key4}`
              checkAlertTime(data.senderID, `${data.dateStart} ${data.timeStart}`, `${data.dateStop} ${data.timeStop}`, configSystem[key1].min, childPart)
            }
          }
        }
      }
    })
  })
}

function checkAlertTime (senderID, timeStart, timeStop, minOfBookingTime, childPart) {
  let format = 'YYYY-MM-DD HH:mm'
  let loopCheck = [
    { timeCheck: timeStart, subtractTime: 30, action: 'alert1' },
    { timeCheck: timeStart, subtractTime: 5, action: 'alert2' },
    { timeCheck: timeStart, addTime: minOfBookingTime, action: 'alert3' },
    { timeCheck: timeStop, subtractTime: 10, action: 'alert4' },
    { timeCheck: timeStop, subtractTime: 0, action: 'alert5' }
  ]
  loopCheck.forEach(value => {
    let timeCheck = null
    let timeCondition = null
    if (value.subtractTime !== null) {
      // เอาเวลาจองลบออกไป  ตามตัวแปร subtractTime หน่วยนาที
      timeCondition = value.subtractTime
      timeCheck = moment(value.timeCheck, format).subtract(timeCondition, 'm')
    } else if (value.addTime !== null) {
      // เอาเวลาจองบวกเพิ่ม ตามเวลา  addTime หน่วยนาที
      timeCondition = value.addTime
      timeCheck = moment(value.timeCheck, format).add(timeCondition, 'm')
    }
    const timeNow = moment(momenTime().tz('Asia/Bangkok').format(format), format)
    // เวลาจองอยู่ห่างจากเวลาปัจจุบันกี่วินาที
    let timeDiff = timeCheck.diff(timeNow, 's')
    // เวลาจองอยู่ก่อน เวลาปัจจบันรึเปล่า ถ้าใช่คืนค่า true และเวลาห่างกัน < 120 วินาที  ( 2 นาที )
    if (timeCheck.isSameOrAfter(timeNow) && (timeDiff < 120)) {
      console.log(`SenderID ${senderID} Alert in ${timeDiff} s`)
      setTimeout(() => {
        alertToUser(senderID, childPart, timeCondition, value.action)
      }, (timeDiff * 1000))
    }
  })
}
function alertToUser (senderID, childPart, time, action) {
  if (action === 'alert1' || action === 'alert2') {
    send.sendTextMessage(senderID, `อีก ${time} นาที จะถึงเวลาจองของคุณ`)
  } else if (action === 'alert4') {
    firebaseDB.checkUserData(senderID).then(value => {
      send.menuChangeTime(senderID, value.language, childPart)
    })
  } else if (action === 'alert3' || action === 'alert5') {
    let genPart = childPart.replace(/:/g, '/')
    firebaseDB.bookingToHistory(genPart, 'endBooking')
  }
}
module.exports = {
  checkAlertTimeAllBooking
}
