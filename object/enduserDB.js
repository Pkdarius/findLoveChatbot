const database = require('./database');
const config = require('config');

const DATABASE_NAME = config.get('DATABASE_NAME');

exports.findUser = (query, callback) => {
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('Enduser');
    collection.find(query).toArray((err, results) => {
      if(err) {
        console.log('findUser err: ', err);
      } else {
        console.log('findUser done!');
        callback(results);
      }
    });
  });
}

exports.saveUser = (doc, options, callback) => {
  console.log(doc);
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('Enduser');
    collection.insertOne(doc, options,(err, results) => {
      if(err) {
        console.log('findUser err: ', err);
      } else {
        console.log('saveUser done!');
        if(callback) {
          callback();
        }
      }
    });
  });
}

exports.updateUser = (filter, update, options) => {
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('Enduser');
    collection.updateOne(filter, update, options, (err, result) => {
      if(err) {
        console.log('updateUser err: ', err);
      } else {
        console.log('updateUser done!');
      }
    });
  });
}