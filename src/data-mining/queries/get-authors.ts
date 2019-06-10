export const findAuthors = async db => {
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
