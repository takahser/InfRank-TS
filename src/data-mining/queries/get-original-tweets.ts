export const findOriginalTweets = async db => {
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
    {
      '$limit': 2e4
    }
  ], {
    allowDiskUse: true,
  }).toArray()

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
