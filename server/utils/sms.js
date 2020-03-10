var unirest = require("unirest");

const sendSMSMessage = (phone, message) => {
  _sms_apistore(phone, message);
};

const sendSMS = (countryCode, localNumber, certcode, wizLive, callback) => {
  let message = wizLive ? "위즈라이브" : "위즈스쿨";
  message += " 회원가입 인증번호는 [" + certcode + "] 입니다.";
  if (countryCode === "+82") {
    _sms_apistore(localNumber, message, callback);
  } else {
    _sms_twilio(countryCode + localNumber, message, callback);
  }
};

const sendPlayLink = (countryCode, localNumber, url, name, callback) => {
  const message = `위즈앱 "${name}" 플레이하기: ${url}`;
  if (countryCode === "+82") {
    _sms_apistore(localNumber, message, callback);
  } else {
    _sms_twilio(countryCode + localNumber, message, callback);
  }
};

// const sendCustomMessage = (countryCode, localNumber, message, callback) => {
//   if (countryCode === "+82") {
//     _sms_apistore(localNumber, message, callback);
//   } else {
//     _sms_twilio(countryCode + localNumber, message, callback);
//   }
// };

const _sms_apistore = (phone, message, callback) => {
  unirest
    .post("http://api.apistore.co.kr/ppurio/1/message/sms/wizschool")
    .header(
      "x-waple-authorization",
      "MTAwOTQtMTU0NzQ2MjA0Mzg2MC00OGUxMjgyOC04MDA3LTQ1ZGMtYTEyOC0yODgwMDc1NWRjNzk="
    )
    .field("dest_phone", phone)
    .field("send_phone", "0263582019")
    .field("send_name", "주식회사 위즈스쿨")
    .field("subject", "위즈스쿨")
    .field("msg_body", message)
    .field("apiVersion", "1")
    .field("id", "wizschool")
    .end(function(result) {
      console.log(result.body);
      if (callback) {
        callback(result);
      }
    });
};

const _sms_twilio = (phone, message, callback) => {
  const accountSid = "AC35c11f699f72040e52091f90e6d6f6ea";
  const authToken = "0119be69758db977526ca44e1dcc5fb9";

  const client = require("twilio")(accountSid, authToken);
  const msg = {
    to: "" + phone,
    from: "+14132062212",
    body: message
  };
  client.messages.create(msg, function(err, message) {
    console.log(err, message);
    callback(err, message);
  });
};

const sendPaymentSMS = (paymentData, isFirstPayment = undefined) => {
  const payment = paymentData.get();
  if (!payment) {
    return false;
  }
  const { information, product, email, buyerPhone } = payment;

  if (!information) {
    return false;
  }

  let { studentName, studentSchool, studentGrade, studentGender } = JSON.parse(
    information
  );

  if (!studentSchool || studentSchool === "") studentSchool = "<미입력>";
  if (!studentGrade || studentGrade === "") studentGrade = "<미입력>";
  studentGender = studentGender === "female" ? "여" : "남";

  let smsMessage;

  if (payment.status === "paid") {
    // 결제 성공시 문자메세지
    const subscriptionMessage = `
* 구매일시로부터 30일이 경과되는 시점에 자동결제됩니다.
* 자동결제 유의사항은 수강권 구매하기 페이지에서 확인해주시기 바랍니다.`;

    const precautionsMessage = `
* 위즈라이브는 <크롬브라우저>에서 사용가능하니 사전에 설치해주시기 바랍니다.
* 화상강의가 가능한 노트북이나 PC로 참여해주시기 바랍니다.`;
    const wrap = "\n";

    const baseMessage = `[위즈라이브] 결제완료
▶ 서비스명 : ${product.name}
▶ 결제금액 : ${product.price}원
▶ 수강생 정보 : ${email} / ${studentName} / ${studentSchool} / ${studentGrade}학년 / ${studentGender}
▶ 수업예약 : wizlive.com 접속 -> 로그인 -> 마이클래스 -> 수업예약하기`;
    if (product.subscription) {
      // 1. 구독결제 메세지
      if (isFirstPayment) {
        // 첫 결제시
        smsMessage =
          baseMessage + wrap + precautionsMessage + wrap + subscriptionMessage;
      } else {
        smsMessage = baseMessage + wrap + subscriptionMessage;
      }
    } else {
      // 2. 일반결제 메세지
      smsMessage = baseMessage + wrap + precautionsMessage;
    }
  } else if (payment.status === "canceled") {
    const baseMessage = `[위즈라이브] 결제취소
▶ 서비스명 : ${product.name}
▶ 수강생 정보 : ${email} / ${studentName} / ${studentSchool} / ${studentGrade}학년 / ${studentGender}
*결제 취소 관련 자세한 절차는 각 카드사를 통해 확인해주시기 바랍니다.
`;
    smsMessage = baseMessage;
  } else {
    // 결제 실패(잔액부족 등등) 이나 다른 경우에 어떤 값이 호출될 지 모르기 때문에 문자 안보냄
    return false;
  }
  if (smsMessage) {
    sendSMSMessage(buyerPhone, smsMessage);
    return true;
  } else {
    return false;
  }
};

module.exports = { sendSMSMessage, sendSMS, sendPlayLink, sendPaymentSMS };
