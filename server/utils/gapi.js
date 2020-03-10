const { google } = require("googleapis");
const uuidv5 = require("uuid/v5");
const moment = require("moment-timezone");

const key = {
  type: "service_account",
  project_id: "wizlive",
  private_key_id: "9d8ff44d20ffaa71b8b33951c8c3ca0e45cb883a",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSOrRDQ51E+eSc\nAQyXImw+TANbzxHGDgMOgez93Sojt6mwuBjSDMFX1H49zL1JMwIcqtuBpujqTtmR\nkFIl8w5n8Ynxn2hPYkwroFrYE8VIv67u3y/e9Vz38a5ICNoFmUT8B+8mNn3hATnn\nJs/LKz3XRTEvriHUB3dtqN0Dy6Quj1mV6lvZ4mNy+YG76JpE3g10CX2NbOgU9bsM\nuOTzQX153O2EBwOYTqEQcKJ7ocnVMzr89JLhivJmn+yqGS10Dns314NZsG7yKPHs\n89Kev+knG8vs9cXGSRCHkJF6r5ULiSoy/kmV5rpH2g6Sdpw5hFrJ6nLSiDEw/txN\nGZZUqas7AgMBAAECggEAAntU7h0Ej0WP8FOG2DCSLI4YgA31Z2wk7G1A5KJRbAiF\nWqO3D0u9QJHZR6t8vzojQpQLHABiFtoFcYAi/XWywYFgH9fCPdBVloeXFZ6Yy/S6\nAPHmORtBFLWSrsuunzWhqIQDdmUFnrwKo0hEWGFTTTubirTjNgM8jVvaor/Vrq2s\nYISjV9OGFKy1/a24Wxvv7YfdyLbJ+aLFvHrv6x8CqeGQIh9b11GMcXjltKtOPTmc\nF4BHPa8I5fPP0xJHItj1E9X6AZ++ueGvwtK7VoPwEg3p2OV+jzg3hKg0U42GgMCB\nV4hihSk8xTZhAxX1TC9VpscubghvdVeH0ZpSUA3OCQKBgQD+fbvHhVA8/oiUpR/0\ngZz55VUDbSE1Sk0BbyOVo3psrS8jZAiWylT3DUAkvlxxJqNzpBIj7AAgKM9NtMiI\nNMXrvWC7H1+znkqZTY1uGS8bnrUHGWz+IwpBzFnbT/xQu9g7uvbx0Wg+5h7PRBBE\nEI2BNx6fErftPzIoe36U8Hrp1QKBgQDTecpBO7ASUKnXAs4mpXy8KE6Riakc3gtt\npb41X1piPB1Lm5WnlusSybjeuUviYL3jb7QxpXxKP8kxzXa9XF75w1pEccRRWF1O\narxCzJ27/4ceVx3AO2tYF9hNdvb4jjocOss2m6dsyLMfDlOwBQTNLs/W4IGSOBAK\nd+Mq9aA4zwKBgHex22f0I9EMRmDjaSwu6g3+9wUthrjxwVYzV6FByoriyZDzs7Z4\nY43vBYRCpGfzrFzvhjiu/0Ag8Z+yr76gU5aU87IPB4wLnzqLZ0GpRqbO9oXoR4Mg\nJ+ramki0ThAKyaEORqdlvooW4dbKRHw+7M8hhZ17yFYlqwmvS9HxaV4hAoGAHzt6\nen3lOB8/piic56pDLMrLJ8Vr+35zs6Lp35oQkDeOoA7/YDvyxdiS/BnjsjBVexSR\nSU/GdnTLMxbENZ1BzaNjXn5q3xSs2xr6aOctWImZnAqDs1NTPDRxVqd+PCFNRcQN\nJSiB5pgRlEGabIGhPuht+682k7DB9bnVDBAwtJMCgYEA1InNxoB5YGyTofdO4q12\nRnCzANWBs/EQlx9twFGuKARitNg5RL3dl7deNJ2dMYsW3nmgecXyprkyZoyUeaWF\nDeGS8AgzxhiD81ino3V5Uw5SXI9ygpSvihWlSEgJVCyxcWwEM7y4u2h0TKEsOTiT\nqThIRkv47uuEJZIU6y6ySWs=\n-----END PRIVATE KEY-----\n",
  client_email: "wizlive@wizlive.iam.gserviceaccount.com",
  client_id: "105508763673885104206",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/wizlive%40wizlive.iam.gserviceaccount.com"
};
const scopes = ["https://www.googleapis.com/auth/calendar"];
const auth = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  scopes
);

function authorize(callback) {
  auth.authorize((err, res) => {
    if (err) {
      console.log(err);
      return;
    }
    google.options({ auth: auth });
    calendar = google.calendar("v3");
    if (callback) callback();
  });
}

/** Calendar Events APIs - https://developers.google.com/calendar/v3/reference/events **/
var calendar;
const calendarId =
  "wizschool.io_qjik165jl6coj8ajj1up1l6sf0@group.calendar.google.com";

function getEvents(callback) {
  if (!calendar) return;
  calendar.events.list(
    {
      calendarId: calendarId
    },
    function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      callback(res.data.items);
    }
  );
}

function addEvent(resource, callback) {
  if (!calendar) return;
  calendar.events.insert(
    {
      calendarId: calendarId,
      resource: resource,
      sendNotifications: true
    },
    function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("gapi calendar added an event");
      if (callback) {
        callback(res.data);
      }
    }
  );
}

function deleteEvent(eventId, callback) {
  if (!calendar) return;
  calendar.events.delete(
    {
      calendarId: calendarId,
      eventId: eventId
    },
    function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("gapi calendar delete an event");
      if (callback) {
        callback();
      }
    }
  );
}
/** Calendar Events APIs - End **/

/** Reservation APIs **/
const namespace = "5ca4beb6-d0ad-5a95-b035-b3dc8d0ae493";

function generateId(reservation) {
  const { studentEmail, tutorEmail, roomId, date, time } = reservation;
  const id = uuidv5(
    `${studentEmail}${tutorEmail}${date}${time}${roomId}`,
    namespace
  ).replace(/\W/g, "");
  return id;
}

function addReservation(reservation, isFreeTrial, callback) {
  const {
    studentEmail,
    tutorEmail,
    studentName,
    tutorName,
    roomId,
    date,
    time
  } = reservation;
  const label = isFreeTrial ? "무료" : "일반";
  const resource = {
    id: generateId(reservation),
    summary: `[${label}] ${studentName} 학생 수업(${tutorName} 튜터)`,
    start: {
      dateTime: moment(`${date}T${time}:00`, "YYYY-MM-DDTHH:mm").format()
    },
    end: {
      dateTime: moment(`${date}T${time}:40`, "YYYY-MM-DDTHH:mm").format()
    }
  };
  addEvent(resource, callback);
}

function deleteReservation(reservation, callback) {
  deleteEvent(generateId(reservation), callback);
}
/** Reservation APIs - End **/

module.exports = {
  authorize,
  calendar: {
    getEvents,
    addEvent,
    deleteEvent,
    addReservation,
    deleteReservation
  }
};
