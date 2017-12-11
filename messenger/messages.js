const askBooking = {
  eng: 'which one do you like to booking',
  th: 'คุณต้องการจอง ห้องหรืออุปกรณ์'
}
const meetingRoom = {
  eng: 'meetingRoom',
  th: 'ห้องประชุม'
}
const device = {
  eng: 'device',
  th: 'อุปกรณ์'
}
// const askRegTitle = {
//   eng: 'What do you want register FITM Co-Workingspace ?',
//   th: 'คุณต้องการสมัครใช้งาน FITM Co-Workingspace ในสถานะใด'
// }
// const student = {
//   eng: 'student',
//   th: 'นักศึกษา'
// }
// const personnel = {
//   eng: 'personnel',
//   th: 'บุคลากร'
// }
// const person = {
//   eng: 'person',
//   th: 'บุคคลทั่วไป'
// }

const selectBookingMenu = (recipientId, language) => {
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
            buttons: [
              {
                type: 'postback',
                title: 'นักศึกษา',
                payload: JSON.stringify({
                  type: 'student'
                })
              },
              {
                type: 'postback',
                title: 'บุคลากร',
                payload: JSON.stringify({
                  type: 'personnel'
                })
              },
              {
                type: 'web_url',
                title: 'บุคคลทั่วไป',
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
const bookingSuccess = (data, language) => {
  let dataPayload = JSON.stringify({
    type: 'cancleBooking',
    data: data.childPart
  })
  let sendType = {
    eng: {
      title: `You Booking ${data.nameTypeItem} Successful`,
      subtitle: `${data.dateStart} ${data.timeStart} To ${data.dateStop} ${data.timeStop}`,
      buttons: [
        {
          type: 'postback',
          title: 'Cancle Booking',
          payload: dataPayload
        }
      ]
    },
    th: {
      title: `คุณได้ทำการจอง ${data.nameTypeItem} เรียบร้อยแล้ว`,
      subtitle: `${data.dateStart} ${data.timeStart} ถึง ${data.dateStop} ${data.timeStop}`,
      buttons: [
        {
          type: 'postback',
          title: 'ยกเลิกการจอง',
          payload: dataPayload
        }
      ]
    }
  }
  return {
    recipient: {
      id: data.senderID
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [sendType[language]]
        }
      }
    }
  }
}
const selectLanguage = (recipientId) => {
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
            title: 'คุณต้องการใช้งาน FITM Co-Workingspace ด้วยภาษาใด',
            subtitle: 'which one language do you like to use it?',
            buttons: [
              {
                type: 'postback',
                title: 'ภาษาไทย',
                payload: JSON.stringify({
                  type: 'selectLanguage',
                  data: 'th'
                })
              },
              {
                type: 'postback',
                title: 'English',
                payload: JSON.stringify({
                  type: 'selectLanguage',
                  data: 'eng'
                })
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
  payload: JSON.stringify({
    type: 'selectBooking'
  })
}
const changLanguage = {
  type: 'postback',
  title: 'Change Language ',
  payload: JSON.stringify({
    type: 'changeLanguage'
  })
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
  registerMenu,
  selectBookingMenu,
  persistentMenu,
  menuChangeTime,
  bookingSuccess,
  selectLanguage
}
