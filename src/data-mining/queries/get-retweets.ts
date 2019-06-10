export const findRetweets = async db => {
  const collection = db.collection('tweetsentiments');
  const tweets = collection.find(
    {
      'rawTweet.lang': 'en',
      'rawTweet.retweeted_status.created_at': { '$exists': true }, // filter after retweets (only RT's)
    }
  ).toArray();
  return tweets;
}
