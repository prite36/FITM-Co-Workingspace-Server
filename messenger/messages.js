var messageChangeStatus = (recipientId) => {
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
            subtitle: 'which one do you like to use it?',
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

module.exports = {
  messageChangeStatus
}
