const MongoClient = require('mongodb').MongoClient;
const jsonfile = require('jsonfile')

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'cryptimentizzle';
 
// Use connect method to connect to the server
MongoClient.connect((url), async (err, client) => {
  console.log("Connected successfully to server");
 
  const db = client.db(dbName);

  const authors = await findAuthors(db, docs => {});
  console.log("TCL: authors", authors)

  const file = './out/authors.json';

  jsonfile.writeFile(file, authors, err => {
    if (err) console.error(err);
  });

  client.close();
 
  // findDocuments(db, (docs) => {
  //   console.log(docs);
  // });
  return;
});

const findAuthors = async (db, callback) => {
  const collection = db.collection('tweetsentiments');

  const authors = collection.aggregate([
    {
      '$match': {
        "rawTweet.lang": "en",
        "rawTweet.retweeted_status.created_at": { "$exists": false },
        "rawTweet.user.verified": true
      }
    },
    {
      '$group': {
        '_id': '$author', 
        'tweets': {
          '$push': '$rawTweet.id_str'
        }
      }
    },
    { "$group": {
      "_id": "$_id",
       "numberOfTweets": {
          "$sum": { "$size": "$tweets" }
       }
     }
    },
    {
      "$sort": { "numberOfTweets": -1 }
    }
  ]).toArray();
  return authors;
}

const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('tweetsentiments');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    console.log("TCL: findDocuments -> err", err)
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}