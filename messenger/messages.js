// เลือกสิ่งที่อยากจะจอง
const selectBookingMenu = (recipientId) => {
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
            title: 'คุณต้องการจอง ห้องหรืออุปกรณ์',
            image_url: 'https://firebasestorage.googleapis.com/v0/b/fitm-coworkingspace.appspot.com/o/calendar.png?alt=media&token=877e7cc5-c1e5-48e0-8fab-0a4fad2e72b7',
            buttons: [
              {
                type: 'postback',
                title: 'ห้องประชุม',
                url: 'https://fitm-coworkingspace.firebaseapp.com/#/booking/' + recipientId + '/meetingroom',
                payload: 'meetingroom'
              },
              {
                type: 'postback',
                title: 'อุปกรณ์',
                url: 'https://fitm-coworkingspace.firebaseapp.com/#/booking/' + recipientId + '/device',
                payload: 'device'
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
            // subtitle: 'which one do you like to use it?',
            buttons: [
              {
                type: 'postback',
                title: 'นักศึกษา',
                payload: 'student'
              },
              {
                type: 'postback',
                title: 'บุคคลากร',
                payload: 'personnel'
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
  registerMenu,
  selectBookingMenu,
  persistentMenu
}
