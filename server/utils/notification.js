// const fb = require("../utils/firebaseUtil");
const firebase = require("../firebase");
const models = require("../models");

const getEmailByPID = async pId => {
  const data = await models.ProjectPublished.findByPk(pId);
  return data.email;
};

const getEmailByCommentId = async id => {
  const data = await models.PublishedComment.findByPk(id);
  return data.email;
};

const getEmailByCommunityArticle = async id => {
  const data = await models.CommunityArticle.findByPk(id);
  return data.email;
};

const getArticleIdByCommentId = async id => {
  const data = await models.CommunityArticleComment.findByPk(id);
  return data.articleId;
};

const getEmailByCommunityCommentId = async id => {
  const data = await models.CommunityArticleComment.findByPk(id);
  return data.email;
};

const sendNoti = async (type, payload) => {
  let params = { type };

  if (type === "custom") {
    params.message = payload.message;
    params.link = payload.link;
    params.email = payload.email;
  } else if (type === "publishedComment") {
    params.targetProjectPID = payload.pId;
    params.email = await getEmailByPID(payload.pId);
    params.targetUserEmail = payload.email;
  } else if (type === "publishedReply") {
    if (payload.targetEmail) {
      params.targetProjectPID = payload.pId;
      params.email = payload.targetEmail;
      params.targetUserEmail = payload.email;
    } else {
      params.targetProjectPID = payload.pId;
      params.email = await getEmailByCommentId(payload.commentId);
      params.targetUserEmail = payload.email;
    }
  } else if (type === "articleComment") {
    params.targetCommunityID = payload.articleId;
    params.email = await getEmailByCommunityArticle(payload.articleId);
    params.targetUserEmail = payload.email;
  } else if (type === "articleReply") {
    params.targetCommunityID = await getArticleIdByCommentId(payload.commentId);
    params.email = await getEmailByCommunityCommentId(payload.commentId);
    params.targetUserEmail = payload.email;
  } else if (type === "like") {
    params.targetProjectPID = payload.pId;
    params.email = await getEmailByPID(payload.pId);
    params.targetUserEmail = payload.email;
  } else if (type === "playCount") {
    params.targetProjectPID = payload.pId;
    params.email = await getEmailByPID(payload.pId);
    params.message = payload.message;
  } else if (type === "subscribe") {
    params.email = payload.creatorEmail;
    params.targetUserEmail = payload.email;
  } else if (type === "newApp") {
    params.email = payload.email;
    params.targetUserEmail = payload.creatorEmail;
    params.targetProjectPID = payload.pId;
  }

  if (params.email && params.targetUserEmail) {
    if (params.email === params.targetUserEmail) {
      return;
    }
  }

  let noti = await models.Notification.create(params);
  noti = await models.Notification.findOne({
    attributes: {
      exclude: ["email", "updatedAt", "isDeleted"]
    },
    where: { id: noti.id },
    include: [
      {
        attributes: ["icon", "name"],
        model: models.User,
        as: "targetUser"
      },
      {
        attributes: ["icon", "name"],
        model: models.ProjectPublished,
        as: "targetProject"
      },
      {
        attributes: ["title"],
        model: models.CommunityArticle,
        as: "targetCommunityArticle"
      }
    ]
  });

  try {
    const user = await models.User.findOne({
      where: { email: params.email },
      attributes: ["id", "appToken", "mobilePlatform", "mobileVersion", "badge"]
    });
    user.badge += 1;
    await user.save();
    if (!user.appToken || user.appToken.length < 5) {
      return;
    }
    let msgText;
    switch (type) {
      case "publishedComment":
        msgText = `${noti.targetUser.name}님이 ${noti.targetProject.name}앱에 댓글을 남겼습니다.`;
        break;
      case "publishedReply":
        msgText = `${noti.targetUser.name}님이 ${noti.targetProject.name}앱에 대댓글을 남겼습니다.`;
        break;
      case "articleComment":
        msgText = `${noti.targetUser.name}님이 ${noti.targetCommunityArticle.title}게시글에 댓글을 남겼습니다.`;
        break;
      case "articleReply":
        msgText = `${noti.targetUser.name}님이 ${noti.targetCommunityArticle.title}게시글에 대댓글을 남겼습니다.`;
        break;
      case "like":
        msgText = `${noti.targetUser.name}님이 ${noti.targetProject.name}앱에 좋아요를 남겼습니다.`;
        break;
      case "playCount":
        msgText = `${noti.targetProject.name}앱의 플레이 수가 ${noti.message}을 돌파했습니다.`;
        break;
      case "subscribe":
        msgText = `${noti.targetUser.name}님이 구독을 시작했습니다.`;
        break;
      case "newApp":
        msgText = `${noti.targetUser.name}님이 새 앱 ${noti.targetProject.name}을 등록했습니다.`;
        break;
      default:
        msgText = noti.message;
    }

    if (user.mobilePlatform === "android") {
      if (!user.mobileVersion || user.mobileVersion < 24) {
        return;
      }
      const message = {
        data: {
          noti: JSON.stringify(noti),
          type: type,
          badge: String(user.badge)
        }
      };
      const response = await firebase
        .messaging()
        .sendToDevice(user.appToken, message);
      console.log(response);
    } else {
      if (!user.mobileVersion || user.mobileVersion < 35) {
        return;
      }
      const message = {
        notification: {
          title: "WizSchool",
          body: msgText,
          sound: "default",
          badge: String(user.badge)
        },
        data: { noti: JSON.stringify(noti) }
      };

      const response = await firebase
        .messaging()
        .sendToDevice(user.appToken, message);
      console.log(response);
    }
  } catch (e) {
    console.error(e);
  }
};

const sendAllNoti = async message => {
  const type = "notice";
  let params = {};
  params.type = type;
  params.message = message.message;
  params.link = message.link;
  //1. find all users who can receive push notification
  const users = await models.User.findAll({
    attributes: [
      "id",
      "email",
      "appToken",
      "mobilePlatform",
      "mobileVersion",
      "badge"
    ],
    where: {
      appToken: { $ne: null },
      mobileVersion: { $ne: null },
      $or: [{ mobilePlatform: "ios" }, { mobilePlatform: "android" }]
    }
  });

  users.forEach(user => {
    //2. user's badge count increased
    user.badge += 1;
    user.save();
    params.email = user.email;
    //3. insert data to notification table
    const noti = params;
    models.Notification.create(noti);
    let msgText = noti.message;
    if (user.mobilePlatform === "android") {
      //4-1. send to android user
      firebase.messaging().sendToDevice(user.appToken, {
        data: {
          noti: JSON.stringify(noti),
          type: type,
          badge: String(user.badge)
        }
      });
    } else if (user.mobilePlatform === "ios") {
      //4-2. send to iOS user
      if (!user.mobileVersion || user.mobileVersion < 35) {
        return;
      }
      firebase.messaging().sendToDevice(user.appToken, {
        notification: {
          title: "WizSchool",
          body: msgText,
          sound: "default",
          badge: String(user.badge)
        },
        data: { noti: JSON.stringify(noti) }
      });
    }
  });
};

module.exports = {
  sendNoti,
  sendAllNoti
};
