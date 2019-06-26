const request = require('request');
const config = require('config');

const PAGE_ACCESS_TOKEN = config.get('PAGE_ACCESS_TOKEN');

exports.retrievingPersonalProfile = (psid, callback) => {
  request({
    uri: `https://graph.facebook.com/${psid}`,
    qs: { fields: "gender,birthday", access_token: PAGE_ACCESS_TOKEN },
    method: "GET"
  }, (err, res, body) => {
    if (!err) {
      console.log('retrievingPersonalProfile done!');
      callback(body);
    } else {
      console.error('Unable to retrieving profile: ', err);
    }
  });
}