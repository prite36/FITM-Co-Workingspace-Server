const pleaseRegister = {
  eng: 'Please Register Before Booking',
  th: 'กรุณาสมัครสมาชิกก่อนจอง'
}
const willSendInfo = {
  eng: 'I will send infomation to ',
  th: 'เราจะส่งข้อมูลของคุณไปที่ '
}
const tellGetKey = {
  eng: ' get key from email and place here for verify your account',
  th: ' สามารถนำ key มาสมัครในเเชทเพื่อยืนยันตัวตน'
}
const stdIdErr = {
  eng: 'Student ID is not valid by format please try again',
  th: 'รหัสนักศึกษาไม่ถูกต้อง กรุณากรอกรหัสใหม่อีกครั้ง'
}
const emailErr = {
  eng: 'Email is not valid by format please try again',
  th: 'อีเมลไม่ถูกต้อง กรุณากรอกอีเมลใหม่อีกครั้ง'
}
const inputstdID = {
  eng: 'Input your student ID 13 digits for recive verify key on email',
  th: 'กรุณากรอกรหัสนักศึกษา 13 หลัก เพื่อรับการยืนยันตัวตนทาง email่'
}
const reqtecherEmail = {
  eng: 'Input your teacher email\nfor recive verify key on email\nEx.xxx.xx@fitm.kmutnb.ac.th',
  th: 'กรุณากรอกอีเมลของมหาวิทยาลัย\nเพื่อยืนยันการสมัครสำหรับ\nการสมัครของอาจารย์ \nเช่น xxx.xx@fitm.kmutnb.ac.th'
}
const sendRegSuccess = {
  eng: 'You Register Success',
  th: 'ท่านสมัครสมาชิกเรียบร้อยแล้ว'
}
const blockRegSuccess = {
  eng: 'You Register Success, You can use it',
  th: 'ท่านสมัครสมาชิกแล้ว สามารถใช้งานได้เลย'
}
const tokenErr = {
  eng: 'Verify token is invalid please try again',
  th: 'รหัสยืนยันตัวตนไม่ถูกต้อง กรุณากรอกรหัสใหม่อีกครั้ง'
}
const selectLanguage = {
  eng: 'All message change to English Language',
  th: 'ข้อความตอบกลับทั้งหมดได้เปลี่ยนเป็นภาษาไทยเรียบร้อยแล้ว'
}
const cancleOrder = {
  eng: 'Your Booking cancle',
  th: 'การจองของคุณถูกยกเลิกแล้ว'
}
const alertBeforeUse = (language, time) => {
  if (language === 'eng') return `${time} minutes will be your booking time.`
  else if (language === 'th') return `อีก ${time} นาที จะถึงเวลาจองของคุณ`
}
const startUseDevice = (nameTypeItem, language) => {
  if (language === 'eng') return `It's time to use ${nameTypeItem}`
  else if (language === 'th') return `ถึงเวลาใช้งาน ${nameTypeItem} ของคุณแล้ว`
}
const endBooking = {
  eng: 'End of time Booking, Thankyou',
  th: 'หมดเวลาจองของคุณแล้ว ขอบคุณที่ใช้บริการ'
}
const sayHello = {
  eng: 'Hello This is Fitm Co-Working space Chat bot.',
  th: 'สวัสดีครับ ยินดีต้อนรับสู่  Fitm Co-Working space Chat bot'
}
const noAnswer = {
  eng: 'I\'m not quite sure what you mean, sorry.',
  th: 'ฉันไม่แน่ใจว่าคุณหมายถึงอะไร'
}
const information = {
  eng: 'FITM co-working space chatbot',
  th: 'FITM co-working space chatbot'
}
const menu = {
  eng: 'Please look for the menu button is below application',
  th: 'ปุ่มเมนูอยู่บริเวณด่านล่างของแอปพลิเคชัน'
}
const welcomeToChatBot = {
  eng: 'Hello, Welcome to FITM-coworking space chatbot',
  th: 'สวัสดีครับ ยินดีต้อนรับเข้าสู่ระบบจองห้องและอุปกรณ์ผ่านระบบแชทบอท'
}
const editProfileSuccess = {
  eng: 'Successful edit profile.',
  th: 'แก้ไขโปรไฟล์เรียบร้อยแล้ว'
}
const blockUser = {
  eng: 'you are blocked.',
  th: 'ขณะนี้ คุณถูกบล็อก! เนื่องจากไม่เช็คอินห้องที่จองตามกำหนด หากติดบัญหา กรุณาติดต่อผู้ดูแลระบบ'
}
const notCheckIn = {
  eng: 'we cancel booking complete! Because of you, not check-in room by rule',
  th: 'เราได้ยกเลิกการจองห้องของคุณแล้ว! เนื่องจากไม่ได้เช็คอินเข้าห้องที่จองไว้ ตามเวลาที่กำหนด'
}
const rejectEditPRofile = {
  eng: 'You can\'t edit profile',
  th: 'คุณไม่สามารถแก้ไขโปรไฟล์ได้'
}
const rejectCancleBooking = {
  eng: 'This booking has been canceled.',
  th: 'การจองนี้ถูกยกเลิกไปแล้ว'
}
module.exports = {
  pleaseRegister,
  willSendInfo,
  tellGetKey,
  stdIdErr,
  inputstdID,
  reqtecherEmail,
  emailErr,
  sendRegSuccess,
  blockRegSuccess,
  tokenErr,
  selectLanguage,
  cancleOrder,
  alertBeforeUse,
  startUseDevice,
  endBooking,
  sayHello,
  noAnswer,
  information,
  menu,
  welcomeToChatBot,
  editProfileSuccess,
  blockUser,
  notCheckIn,
  rejectEditPRofile,
  rejectCancleBooking
}
