const sendToSlack = msg => {
  var IncomingWebhook = require("@slack/client").IncomingWebhook;
  var url =
    "https://hooks.slack.com/services/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";
  var webhook = new IncomingWebhook(url);
  // webhook.send(msg);
};

const sendToSlackStatistics = msg => {
  var IncomingWebhook = require("@slack/client").IncomingWebhook;
  var url =
    "https://hooks.slack.com/services/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";
  var webhook = new IncomingWebhook(url);
  // webhook.send(msg);
};

const sendFeedbackToSlack = msg => {
  var IncomingWebhook = require("@slack/client").IncomingWebhook;
  var url =
    "https://hooks.slack.com/services/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";
  var webhook = new IncomingWebhook(url);
  // webhook.send(msg);
};

module.exports = { sendToSlack, sendToSlackStatistics, sendFeedbackToSlack };
