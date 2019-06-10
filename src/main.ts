import { findAuthors, findOriginalTweets, findRetweets } from './data-mining/queries';
import { Tweet } from './domain';
import { dbName, getMongoClient } from './persistence';

import * as jsonfile from 'jsonfile';

const main = async () => {
  const mongoClient = await getMongoClient()

  const db = mongoClient.db(dbName)

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

  mongoClient.close() 
}

main()
