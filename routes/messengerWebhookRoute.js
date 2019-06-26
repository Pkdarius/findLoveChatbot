const express = require('express');
const config = require('config');

const route = express.Router();

const messengerApi = require('../facebook/messengerApi');
const facebookApi = require('../facebook/api');
const enduserDB = require('../object/enduserDB');

const WEBHOOK_VERIFY_TOKEN = config.get('WEBHOOK_VERIFY_TOKEN');

route.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

route.post('/webhook', (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      if (entry.messaging) {
        webhookMessenger(entry);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const webhookMessenger = (entry) => {
  let webhook_event = entry.messaging[0];
  console.log(JSON.stringify(webhook_event));
  let sender_psid = webhook_event.sender.id;

  enduserDB.findUser({ psid: sender_psid }, results => {
    const promise = new Promise((resolve, reject) => {
      if (results.length === 0) {
        facebookApi.retrievingPersonalProfile(sender_psid, result => {
          result = JSON.parse(result);
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        });
      } else {
        if (webhook_event.message) {
          messengerApi.handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          messengerApi.handlePostback(sender_psid, webhook_event.postback);
        }
      }
    }).then((result) => {
      return new Promise((resolve, reject) => {
        enduserDB.saveUser({
          psid: sender_psid,
          // birthday: result.birthday,
          gender: result.gender,
          isFinding: false,
          isChatting: false,
          chatWith: ''
        }, null, resolve());
      })
    }).then(() => {
      setTimeout(() => {
        if (webhook_event.message) {
          messengerApi.handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          messengerApi.handlePostback(sender_psid, webhook_event.postback);
        }
      }, 500);
    }).catch((error) => {
      console.log(error);
    });
  });
}

module.exports = route;