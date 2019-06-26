const mongodb = require('mongodb');
const config = require('config');

const mongoClient = mongodb.MongoClient;

const MONGO_URL = config.get('MONGO_URL');

exports.getConnection = (callback) => {
  mongoClient.connect(MONGO_URL, { useNewUrlParser: true }, (err, client) => {
    if(err) {
      console.log('Unable to connect with mongoDB');
    } else {
      callback(client);
    }
  });
}