const IAMPORT_KEY = "5047278478061629";
const IAMPORT_SECRET =
  "qMXL4DNAJdl0ZarHXwk4dCZbEWWrr3JRPHCTlpu4CQ5C0wkX2E2gh1rVXnmor6fhORbahFfUvlxwSRuV";
const fetch = require("node-fetch");

// 정기결제에 필요한 im'port API
async function getToken() {
  try {
    let response = await fetch("https://api.iamport.kr/users/getToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      body: JSON.stringify({
        imp_key: IAMPORT_KEY, // REST API키
        imp_secret: IAMPORT_SECRET // REST API Secret
      })
    });
    let tokenData = await response.json();
    if (!tokenData || tokenData.code !== 0) {
      return;
    }
    const { access_token } = tokenData.response; // 인증 토큰
    return access_token;
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function iamportPaymentAgain(params) {
  let { customer_uid, merchant_uid, amount, name, notice_url } = params;
  try {
    const access_token = await getToken();
    if (!access_token) {
      console.log("token is got fail");
      return;
    }

    let iamportResult = await fetch(
      `https://api.iamport.kr/subscribe/payments/again`,
      {
        method: "POST",
        headers: {
          Authorization: access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_uid,
          merchant_uid,
          amount, // 0원으로 하면 결제 안됨
          name,
          notice_url
        })
      }
    );
    iamportResult = await iamportResult.json();
    if (!iamportResult) {
      return;
    }
    return iamportResult;
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function iamportAddSchedules(params) {
  let { customer_uid, schedule } = params;
  try {
    const access_token = await getToken();
    if (!access_token) {
      console.log("token is got fail");
      return;
    }
    if (!access_token) {
      console.log("token is got fail");
      return;
    }
    let response = await fetch(
      `https://api.iamport.kr/subscribe/payments/schedule`,
      {
        method: "POST",
        headers: {
          Authorization: access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_uid: customer_uid,
          schedules: [schedule]
        })
      }
    );
    const result = await response.json();
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function iamportUnschedule(params) {
  let { customer_uid } = params;
  try {
    const access_token = await getToken();
    if (!access_token) {
      console.log("token is got fail");
      return;
    }
    let response = await fetch(
      `https://api.iamport.kr/subscribe/payments/unschedule`,
      {
        method: "POST",
        headers: {
          Authorization: access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_uid: customer_uid
        })
      }
    );

    const result = await response.json();
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function getPaymentData(params) {
  let { imp_uid } = params;
  try {
    const access_token = await getToken();
    if (!access_token) {
      console.log("token is got fail");
      return;
    }
    let response = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
      method: "get",
      headers: {
        Authorization: access_token,
        "Content-Type": "application/json"
      }
    });
    const result = await response.json();
    if (!result) {
      return;
    }
    return result.response;
  } catch (err) {
    console.error(err);
    next(err);
  }
}

const makeMerchantUid = email => {
  return email + "_" + new Date().getTime();
};

module.exports = {
  getToken,
  iamportPaymentAgain,
  iamportAddSchedules,
  iamportUnschedule,
  getPaymentData,
  makeMerchantUid
};
