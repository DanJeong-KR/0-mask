const firebase = require("../firebase");

const sendMessage = (message = {}) => {
  console.log("in firebase sendMessage", message);
  return firebase.messaging().send(message);
  // .then(response => {
  //   // Response is a message ID string.
  //   console.log("Successfully sent message:", response);
  // })
  // .catch(error => {
  //   console.log("Error sending message:", error);
  // });
};

module.exports = { sendMessage };
