const database = require('./database');
const config = require('config');

const DATABASE_NAME = config.get('DATABASE_NAME');

exports.findUser = (query, callback) => {
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const femaleCollection = db.collection('female');
    femaleCollection.find(query).toArray((err, results) => {
      if (err) {
        console.log('findUser err: ', err);
      } else {
        if (results.length === 0) {
          const maleCollection = db.collection('male');
          maleCollection.find(query).toArray((err, results) => {
            if (err) {
              console.log('findUser err: ', err);
            } else {
              console.log('findUser done!');
              callback(results);
            }
          });
        } else {
          console.log('findUser done!');
          callback(results);
        }
      }
    });
  });
}

exports.aggregateUser = (collectionName, aggregate, callback) => {
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(collectionName);

    collection.aggregate(aggregate).toArray((err, results) => {
      if (err) {
        console.log('aggregateUser err: ', err);
      } else {
        console.log('aggregateUser done!');
        callback(results);
      }
    });
  });
}

exports.saveUser = (collectionName, doc, options, callback) => {
  console.log(doc);
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(collectionName);
    collection.insertOne(doc, options, (err, results) => {
      if (err) {
        console.log('findUser err: ', err);
      } else {
        console.log('saveUser done!');
        if (callback) {
          callback();
        }
      }
    });
  });
}

exports.updateUser = (collectionName, filter, update, options) => {
  database.getConnection(client => {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(collectionName);
    collection.updateOne(filter, update, options, (err, result) => {
      if (err) {
        console.log('updateUser err: ', err);
      } else {
        console.log('updateUser done!');
      }
    });
  });
}