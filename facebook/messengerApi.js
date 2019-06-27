const request = require('request');
const config = require('config');

const enduserDB = require('../object/enduserDB');

const PAGE_ACCESS_TOKEN = config.get('PAGE_ACCESS_TOKEN');
const GROUP_ID = config.get('GROUP_ID');
const fbApi = require('./api');

exports.handleMessage = (sender_psid, received_message) => {
  enduserDB.findUser({ psid: sender_psid }, (users) => {
    const user = users[0];
    if (user.isFinding) {
      const response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": "Mình có thể giúp gì cho bạn? ^^",
            "buttons": [
              {
                "type": "postback",
                "title": "Ngưng tìm gấu 🐻",
                "payload": "CANCEL_FINDING"
              }
            ]
          }
        }
      }
      this.callSendAPI(sender_psid, response);
    } else if (user.isChatting) {
      if (received_message.text) {
        const response = {
          text: received_message.text
        }
        this.callSendAPI(user.chatWith, response);
      } else if (received_message.attachments) {
        console.log(received_message.attachments);
        let response = {
          attachment: received_message.attachments[0]
        }
        if (response.attachment.payload.sticker_id) {
          delete response.attachment.payload.sticker_id;
        }
        this.callSendAPI(user.chatWith, response);
      }
    } else {
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": "Mình có thể giúp gì cho bạn? ^^",
            "buttons": [
              {
                "type": "postback",
                "title": "Tìm gấu 🐻",
                "payload": "FIND_FRIEND"
              }
            ]
          }
        }
      }
      this.callSendAPI(sender_psid, response);
    }
  });
}

exports.handlePostback = (sender_psid, received_postback) => {
  enduserDB.findUser({ psid: sender_psid }, async (users) => {
    const user = users[0];
    switch (received_postback.payload) {
      case 'GET_STARTED':
      case 'ASSISTANT':
        if (user.isFinding) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Mình có thể giúp gì cho bạn? ^^",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Ngưng tìm gấu 🐻",
                    "payload": "CANCEL_FINDING"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Mình có thể giúp gì cho bạn? ^^",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Kết thúc trò chuyện",
                    "payload": "CANCEL_CHATTING"
                  }, {
                    "type": "postback",
                    "title": "Báo cáo người dùng",
                    "payload": "REPORT"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Mình có thể giúp gì cho bạn? ^^",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Tìm gấu 🐻",
                    "payload": "FIND_FRIEND"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
      case 'FIND_FRIEND':
        if (user.isFinding) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": 'Đang tìm gấu 🐻...bạn vui lòng đợi trong khi bot tìm cho bạn nha!',
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Ngưng tìm gấu 🐻",
                    "payload": "CANCEL_FINDING"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": 'Không thể tìm gấu mới khi bạn đang chat. Nếu muốn tìm gấu mới, gõ "pp" hoặc bấm "Kết thúc cuộc trò chuyện" để kết thúc trò chuyện!',
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Kết thúc cuộc trò chuyện",
                    "payload": "CANCEL_CHATTING"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          await enduserDB.updateUser(user.gender === 'male' ? 'male' : 'female', { psid: sender_psid }, { $set: { isFinding: true, isChatting: false, chatWith: '' } }, null);
          await enduserDB.aggregateUser(user.gender !== 'male' ? 'male' : 'female', [{ $match: { psid: { $ne: sender_psid }, isFinding: true, isChatting: false, gender: { $ne: user.gender } } }, { $sample: { size: 1 } }], async usersList => {
            if (usersList.length === 0) {
              const response = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "button",
                    "text": 'Đang tìm gấu 🐻...bạn vui lòng đợi trong khi bot tìm cho bạn nha!',
                    "buttons": [
                      {
                        "type": "postback",
                        "title": "Ngưng tìm gấu 🐻",
                        "payload": "CANCEL_FINDING"
                      }
                    ]
                  }
                }
              }
              await this.callSendAPI(sender_psid, response);
            } else {
              let randomUser = usersList[Math.floor(Math.random() * usersList.length)];

              await enduserDB.updateUser(user.gender === 'male' ? 'male' : 'female', { psid: sender_psid }, { $set: { isFinding: false, isChatting: true, chatWith: randomUser.psid } }, null);
              await enduserDB.updateUser(randomUser.gender === 'male' ? 'male' : 'female', { psid: randomUser.psid }, { $set: { isFinding: false, isChatting: true, chatWith: sender_psid } }, null);

              const response = {
                "text": 'Mình đã tìm thấy một chú gấu 🐻 Chúc bạn có cuộc trò chuyện vui vẻ ^^!',
              }
              await this.callSendAPI(randomUser.psid, response);
              await this.callSendAPI(sender_psid, response);
            }
          });
        }
        break;
      case 'CANCEL_FINDING':
        if (user.isFinding) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Bạn có muốn ngưng tìm kiếm?",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Đồng ý",
                    "payload": "ACCEPT_CANCEL_FINDING"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          response = {
            "text": "Không thể thực hiện thao tác trong khi bạn đang chat ^^"
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          response = {
            "text": "Không thể thực hiện thao tác trong khi không tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
      case 'CANCEL_CHATTING':
        if (user.isFinding) {
          response = {
            "text": "Không thể thực hiện thao tác trong khi đang tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Bạn có muốn ngưng cuộc trò chuyện? Lưu ý bạn sẽ không thể kết nối lại được với chú gấu này",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Đồng ý",
                    "payload": "ACCEPT_CANCEL_CHATTING"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          const response = {
            "text": "Không thể thực hiện thao tác trong khi không tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
      case 'REPORT':
        if (user.isFinding) {
          response = {
            "text": "Không thể thực hiện thao tác trong khi đang tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Bạn có muốn báo cáo tên gấu này? Sau khi báo cáo, chúng tôi sẽ kiểm tra và quyết định block tên này!",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Đồng ý",
                    "payload": "ACCEPT_REPORTING"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          const response = {
            "text": "Không thể thực hiện thao tác trong khi không chat với ai ^^"
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
      case 'ACCEPT_CANCEL_FINDING':
        if (user.isFinding) {
          await enduserDB.updateUser(user.gender === 'male' ? 'male' : 'female', { psid: sender_psid }, { $set: { isFinding: false, isChatting: false, chatWith: '' } }, null);
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": 'Bạn đã ngưng tìm kiếm ^^ Bạn có thể tiếp tục tìm kiếm đối bằng cách bấm vào "Tìm gấu 🐻"',
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Tìm gấu 🐻",
                    "payload": "FIND_FRIEND"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          const response = {
            "text": "Không thể thao tác khi bạn đang ở trong cuộc trò chuyện!"
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          const response = {
            "text": "Không thể thực hiện thao tác trong khi không tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
      case 'ACCEPT_CANCEL_CHATTING':
        if (user.isFinding) {
          const response = {
            "text": "Không thể thực hiện thao tác trong khi đang tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          await enduserDB.updateUser(user.gender === 'male' ? 'male' : 'female', { psid: sender_psid }, { $set: { isFinding: false, isChatting: false, chatWith: '' } }, null);
          await enduserDB.updateUser(user.gender !== 'male' ? 'male' : 'female', { psid: user.chatWith }, { $set: { isFinding: false, isChatting: false, chatWith: '' } }, null);
          const response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": 'Bạn đã kết thúc cuộc trò chuyện chú gấu này 😢 Bạn có muốn tìm gấu khác?',
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Tìm gấu 🐻",
                    "payload": "FIND_FRIEND"
                  }
                ]
              }
            }
          }

          const response2 = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": 'Chú gấu này đã kết thúc cuộc trò chuyện 😢 Bạn có muốn tìm gấu khác?',
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Tìm gấu 🐻",
                    "payload": "FIND_FRIEND"
                  }
                ]
              }
            }
          }
          await this.callSendAPI(sender_psid, response);
          await this.callSendAPI(user.chatWith, response2);
        } else {
          const response = {
            "text": "Không thể thực hiện thao tác trong khi không tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
      case 'ACCEPT_REPORTING':
        if (user.isFinding) {
          response = {
            "text": "Không thể thực hiện thao tác trong khi đang tìm gấu ^^"
          }
          await this.callSendAPI(sender_psid, response);
        } else if (user.isChatting) {
          const response = {
            "text": "Cảm ơn phản hồi của bạn. Chúng tôi sẽ kiểm tra người dùng này và đưa ra quyết định!"
          }
          await this.callSendAPI(sender_psid, response);
        } else {
          const response = {
            "text": "Không thể thực hiện thao tác trong khi không chat với ai ^^"
          }
          await this.callSendAPI(sender_psid, response);
        }
        break;
    }
  });
}

exports.callSendAPI = (sender_psid, response) => {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": JSON.stringify(response)
  }

  request({
    "uri": "https://graph.facebook.com/v3.3/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('body response: ', JSON.stringify(body));
    } else {
      console.error('Unable to send message:', err);
    }
  });
}