import { Tweet } from "../domain";

const MongoClient = require('mongodb').MongoClient;
const jsonfile = require('jsonfile')

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'cryptimentizzle';

// Use connect method to connect to the server
MongoClient.connect((url)).then(async client => {
  console.log('Connected successfully to server');
 
  const db = client.db(dbName);

  /**
   * 1. Get Authors
   */
  const authors = await findAuthors(db);

  const authorsWithUrls = authors.map(a => ({
    userName: a._id,
    numberOfTweets: a.numberOfTweets,
    url: `https://twitter.com/${a._id}`
  }));

  // console.log('TCL: authors', authorsWithUrls)

  const authorsFile = './out/authors.json';

  jsonfile.writeFile(authorsFile, authorsWithUrls, err => {
    if (err) console.error(err);
  });

  /**
   * 2. Get original Tweets
   */
  const originalTweets = await findOriginalTweets(db);
  console.log("TCL: originalTweets", originalTweets);

  /**
   * 3. get retweets
   */
  const retweets = await findRetweets(db);
  console.log("TCL: retweets", retweets)
  
  /**
   * 4. aggregate tweets
   */
  const aggregatedTweets: Tweet[] = originalTweets
    .map(ot => ({
      id: ot.rawTweet.id_str,
      author: {
        id: ot.author,
        nickname: ot.author,
      },
      retweeter: retweets
        .filter(r => r.rawTweet.retweeted_status.id_str === ot.rawTweet.id_str)
        .map(r => ({
          id: r.author,
          nickname: r.author,
        }))
    }))
  console.log("TCL: aggregatedTweets", aggregatedTweets)
  const tweetsFile = './out/tweets.json';

  jsonfile.writeFile(tweetsFile, aggregatedTweets, err => {
    if (err) console.error(err);
  });

  client.close();
 
  return;
});

const findAuthors = async db => {
  const collection = db.collection('tweetsentiments');

  const authors = collection.aggregate([
    {
      '$match': {
        'rawTweet.lang': 'en',
        'rawTweet.retweeted_status.created_at': { '$exists': false }, // filter after original tweets (no RT's)
        // 'rawTweet.user.verified': true
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
    {
      '$group': {
        '_id': '$_id',
         'numberOfTweets': {
            '$sum': { '$size': '$tweets' }
         }
       }
    },
    {
      '$sort': { 'numberOfTweets': -1 }
    }
  ]).toArray();
  return authors;
}

const findOriginalTweets = async db => {
  const collection = db.collection('tweetsentiments');

  const originalTweets = await collection.aggregate([
    {
      '$match': {
        'rawTweet.lang': 'en',
        'rawTweet.retweeted_status.created_at': { '$exists': false }, // filter after original tweets (no RT's)
      },
    },
    {
      '$sort': { 'author' : -1 }
    },
    // {
    //   '$limit': 100
    // }
  ], {
    allowDiskUse: true,
  }).toArray();

  const uniqueTweets = originalTweets
    .reduce((tweets, currentTweet) => {
      if (!tweets.find(t => t.rawTweet.id_str === currentTweet.rawTweet.id_str)) {
        tweets = [
          ...tweets,
          currentTweet
        ];
      }
      return tweets;
    }, []);

  return uniqueTweets;
}

const findRetweets = async db => {
  const collection = db.collection('tweetsentiments');
  const tweets = collection.find(
    {
      'rawTweet.lang': 'en',
      'rawTweet.retweeted_status.created_at': { '$exists': true }, // filter after retweets (only RT's)
    }
  ).toArray();
  return tweets;
}
