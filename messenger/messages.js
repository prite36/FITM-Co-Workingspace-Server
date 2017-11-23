const firebase = require('firebase')
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
const checkUserData = (senderID) => {
  return new Promise((resolve, reject) => {
    db.ref('state/' + senderID).once('value', snapshot => {
      resolve(snapshot.val())
    })
  })
}
const askBooking = {
  en: 'คุณต้องการจอง ห้องหรืออุปกรณ์',
  th: 'which one do you like to booking'
}
const meetingRoom = {
  en: 'meetingRoom',
  th: 'ห้องประชุม'
}
const device = {
  en: 'device',
  th: 'อุปกรณ์'
}
const student = {
  en: 'student',
  th: 'นักศึกษา'
}
const personnel = {
  en: 'personnel',
  th: 'บุคลากร'
}
const person = {
  en: 'person',
  th: 'บุคคลทั่วไป'
}
const sendRegSuccess = {
  en: 'registerSuccess',
  th: 'ท่านสมัครสมาชิกเรียบร้อยแล้ว'
}
const tokenErr = {
  en: 'Verify token is invalid please try again',
  th: 'รหัสยืนยันตัวตนไม่ถูกต้อง กรุณากรอกรหัสใหม่อีกครั้ง'
}
const selectBookingMenu = (recipientId) => {
  let language = null
  checkUserData(recipientId).then(value => {
    language = value.language
  })
  return {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: askBooking[language],
            image_url: 'https://firebasestorage.googleapis.com/v0/b/fitm-coworkingspace.appspot.com/o/calendar.png?alt=media&token=877e7cc5-c1e5-48e0-8fab-0a4fad2e72b7',
            buttons: [
              {
                type: 'web_url',
                title: meetingRoom[language],
                url: 'https://fitm-coworkingspace.firebaseapp.com/#/booking/' + recipientId + '/meetingroom',
                webview_height_ratio: 'tall',
                webview_share_button: 'hide'
              },
              {
                type: 'web_url',
                title: device[language],
                url: 'https://fitm-coworkingspace.firebaseapp.com/#/booking/' + recipientId + '/device',
                webview_height_ratio: 'tall',
                webview_share_button: 'hide'
              }
            ]
          }]
        }
      }
    }
  }
}
const registerMenu = (recipientId) => {
  let language = null
  checkUserData(recipientId).then(value => {
    language = value.language
  })
  return {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'คุณต้องการสมัครใช้งาน FITM Co-Workingspace ในสถานะใด',
            subtitle: 'You want register FITM Co-Workingspace ?',
            buttons: [
              {
                type: 'postback',
                title: student[language],
                payload: 'student'
              },
              {
                type: 'postback',
                title: personnel[language],
                payload: 'personnel'
              },
              {
                type: 'web_url',
                title: person[language],
                url: 'https://fitm-coworkingspace.firebaseapp.com/#/register/' + recipientId + '/person',
                webview_height_ratio: 'tall',
                webview_share_button: 'hide'
              }
            ]
          }]
        }
      }
    }
  }
}
const registerSuccess = (data) => {
  return {
    recipient: {
      id: data.senderID
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: `คุณได้ทำการจอง ${data.nameTypeItem} เรียบร้อยแล้ว`,
            subtitle: `${data.dateStart} ${data.timeStart} ถึง ${data.dateStop} ${data.timeStop}`,
            buttons: [
              {
                type: 'postback',
                title: 'ยกเลิกการจอง',
                payload: `cancleBooking${data.childPart}`
              }
            ]
          }]
        }
      }
    }
  }
}
const menuChangeTime = (recipientId, childPart) => {
  return {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'อีก 10 นาที จะหมดเวลาจองของคุณ คุณสามารถยืดเวลาจองได้',
            buttons: [
              {
                type: 'web_url',
                title: 'ยืดเวลาจอง',
                url: 'https://fitm-coworkingspace.firebaseapp.com/#/reBooking/' + recipientId + childPart,
                webview_height_ratio: 'tall',
                webview_share_button: 'hide'
              }
            ]
          }]
        }
      }
    }
  }
}
const selectBookingButton = {
  type: 'postback',
  title: 'Booking Room & Device',
  payload: 'selectBooking'
}
const changLanguage = {
  type: 'postback',
  title: 'Change Language ',
  payload: 'changeLanguage'
}
const persistentMenu = {
  setting_type: 'call_to_actions',
  thread_state: 'existing_thread',
  call_to_actions: [
    selectBookingButton,
    changLanguage
  ]
}
module.exports = {
  sendRegSuccess,
  tokenErr,
  registerMenu,
  selectBookingMenu,
  persistentMenu,
  menuChangeTime,
  registerSuccess
}
