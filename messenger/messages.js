const askBooking = {
  eng: 'which one do you like to booking?',
  th: 'คุณต้องการจอง ห้องหรืออุปกรณ์'
}
const meetingRoom = {
  eng: 'Meeting Room',
  th: 'ห้องประชุม'
}
const device = {
  eng: 'Device',
  th: 'อุปกรณ์'
}
const askRegister = {
  eng: 'What status do you want to register?',
  th: 'คุณต้องการสมัครใช้งาน FITM Co-Workingspace ในสถานะใด'
}
const student = {
  eng: 'Student',
  th: 'นักศึกษา'
}
const staff = {
  eng: 'Staff',
  th: 'บุคลากร'
}
const guest = {
  eng: 'Guest',
  th: 'บุคคลทั่วไป'
}
const menuEditProfile = {
  eng: 'Edit Profile',
  th: 'แก้ไขโปรไฟล์'
}
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
            image_url: 'https://firebasestorage.googleapis.com/v0/b/fitm-coworking-space.appspot.com/o/booking_ICON.png?alt=media&token=fa18082d-d203-4c2e-8360-d6b416e555bc',
            buttons: [
              {
                type: 'web_url',
                title: meetingRoom[language],
                url: 'https://fitm-coworking-space.firebaseapp.com/#/booking/meetingroom',
                webview_height_ratio: 'full',
                webview_share_button: 'hide',
                messenger_extensions: 'true'
              },
              {
                type: 'web_url',
                title: device[language],
                url: 'https://fitm-coworking-space.firebaseapp.com/#/booking/device',
                webview_height_ratio: 'full',
                webview_share_button: 'hide',
                messenger_extensions: 'true'
              }
            ]
          }]
        }
      }
    }
  }
}
const registerMenu = (recipientId, language) => {
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
            title: askRegister[language],
            buttons: [
              {
                type: 'postback',
                title: student[language],
                payload: JSON.stringify({
                  type: 'student'
                })
              },
              {
                type: 'postback',
                title: staff[language],
                payload: JSON.stringify({
                  type: 'staff'
                })
              },
              {
                type: 'web_url',
                title: guest[language],
                url: 'https://fitm-coworking-space.firebaseapp.com/#/register/guest',
                webview_height_ratio: 'full',
                webview_share_button: 'hide',
                messenger_extensions: 'true'
              }
            ]
          }]
        }
      }
    }
  }
}
const editProfile = (recipientId, language) => {
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
            title: '.',
            image_url: 'https://firebasestorage.googleapis.com/v0/b/fitm-coworking-space.appspot.com/o/editProfile_ICON.png?alt=media&token=8a7bb36d-9e01-480f-b97f-d30b03aca305',
            buttons: [
              {
                type: 'web_url',
                title: menuEditProfile[language],
                url: 'https://fitm-coworking-space.firebaseapp.com/#/editProfile',
                webview_height_ratio: 'full',
                webview_share_button: 'hide',
                messenger_extensions: 'true'
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
const startUseMeetRoom = (recipientId, nameTypeItem, password, language) => {
  let text = {
    eng: `It's time to use ${nameTypeItem} \n Password : ${password}`,
    th: `ถึงเวลาใช้งาน ${nameTypeItem} ของคุณแล้ว \n รหัสผ่านคือ : ${password}`
  }
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
            title: text[language],
            buttons: [{
              type: 'element_share'
            }]
          }]
        }
      }
    }
  }
}
const menuChangeTime = (recipientId, language, childPart) => {
  let sendType = {
    eng: {
      title: 'End of time in 10 minute, you can booking continue',
      buttons: [
        {
          type: 'web_url',
          title: 'Booking continue',
          url: 'https://fitm-coworking-space.firebaseapp.com/#/reBooking/' + childPart,
          webview_height_ratio: 'full',
          webview_share_button: 'hide',
          messenger_extensions: 'true'
        }
      ]
    },
    th: {
      title: 'อีก 10 นาที จะหมดเวลาจองของคุณ คุณสามารถยืดเวลาจองได้',
      buttons: [
        {
          type: 'web_url',
          title: 'ยืดเวลาจอง',
          url: 'https://fitm-coworking-space.firebaseapp.com/#/reBooking/' + childPart,
          webview_height_ratio: 'full',
          webview_share_button: 'hide',
          messenger_extensions: 'true'
        }
      ]
    }
  }
  return {
    recipient: {
      id: recipientId
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
const selectBookingButton = {
  type: 'postback',
  title: 'Booking Rooms & Devices',
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
const feedBack = {
  type: 'web_url',
  title: 'Feedback',
  url: 'https://fitm-coworking-space.firebaseapp.com/#/feedback/',
  webview_height_ratio: 'full',
  webview_share_button: 'hide',
  messenger_extensions: 'true'
}
const persistentMenu = {
  setting_type: 'call_to_actions',
  thread_state: 'existing_thread',
  call_to_actions: [
    selectBookingButton,
    changLanguage,
    feedBack
  ]
}
module.exports = {
  selectBookingMenu,
  registerMenu,
  editProfile,
  persistentMenu,
  menuChangeTime,
  bookingSuccess,
  selectLanguage,
  startUseMeetRoom
}
