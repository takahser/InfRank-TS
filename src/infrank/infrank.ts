import * as fs from 'fs';
import * as jsonfile from 'jsonfile';
import neatCsv from 'neat-csv';
import * as util from 'util';

import { findOriginalTweets, findRetweets } from '../data-mining/queries';
import { Association, AssociationType, Author, AuthorRank, sortAuthorRanksDescending, Tweet } from '../domain';
import { dbName, getMongoClient } from '../persistence';

/**
 * global variables
 */
const d = 0.85
const csvPath = './in/authors.csv';

const analyze = async () => {

  /**
   * 0. get authors with corp data info
   */
  const readFile = util.promisify(fs.readFile);
  let csvData = await readFile(csvPath, 'utf8'); // Get csv string from file
  const allAuthors = await neatCsv(csvData)

  /**
   * 1. get tweets from db
   */
  const mongoClient = await getMongoClient()
  const db = mongoClient.db(dbName)
  const originalTweets = await findOriginalTweets(db)
  const retweets = await findRetweets(db);
  const tweets: Tweet[] = originalTweets
    .map(ot => ({
      id: ot.rawTweet.id_str,
      author: {
        id: ot.author,
        nickname: ot.author,
      },
      sentiment: ot.sentiment,
      authorFollowers: ot.author_followers,
      retweeter: retweets
        .filter(r => r.rawTweet.retweeted_status.id_str === ot.rawTweet.id_str)
        .map(r => ({
          id: r.author,
          nickname: r.author,
        }))
    }))

  /**
   * 2. evaluate edges and authors
   */
  const retweetEdges: Association[] = tweets
    .flatMap(t =>
      t.retweeter.map(
          r => ({
            source: r,
            target: t.author,
            label: AssociationType.Retweeting,
          })
        ))
  
  const authors = tweets.reduce((authors: Author[], tweet: Tweet) => {
    const authorIndex = authors.findIndex(a => a.id === tweet.author.id)
    if (authorIndex > -1) { // author exists
      authors[authorIndex] = {
        ...authors[authorIndex],
        sentiments: [
          ...authors[authorIndex].sentiments,
          tweet.sentiment,
        ]
      }
      return authors
    }
    return [
      ...authors,
      {
        ...tweet.author,
        sentiments: [ tweet.sentiment ],
        followers: tweet.authorFollowers
      }
    ]
  }, [])
  
  /**
   * 3. methods
   */
  const O = (author: Author, label: AssociationType) => retweetEdges
    .filter(e => e.source.id === author.id && e.label === label)
    .map(e => e.source)
  
  const I = (author: Author, label: AssociationType) => retweetEdges
    .filter(e => e.target.id === author.id && e.label === label)
    .map(e => e.target)
  
  const T = (author: Author) => tweets
    .filter(t => t.author.id === author.id)
  
  const R = (source: Author): Tweet[] => retweetEdges
    .filter(e => e.source.id === source.id)
      .flatMap(e =>
        tweets.filter(t =>
          t.author.id === e.source.id
        )
      )
  
  const P = (author: Author) => author.followers // I(author, AssociationType.Retweeting).length
  
  const InfRank = (author: Author) => P(author) / authors.length
  
  const w_r = (a_i: Author, a_j: Author) =>
    T(a_i)
      .filter(
        t => R(a_j).find(r => r.id === t.id)
      )
    .length / T(a_i).length
  
  const w_r_sum = (a_i: Author, previousRank: number) => I(a_i, AssociationType.Retweeting)
    .reduce((sum, a_j) => {
      const o = O(a_j, AssociationType.Retweeting).length
  
      // avoid illegal division by 0
      // TODO: sync with paper
      return o > 0
        ? sum + w_r(a_j, a_i) * previousRank / O(a_j, AssociationType.Retweeting).length
        : sum
    }, 0)
  
  // without using d (a.k.a. d = 0)
  // k = 0
  const initialAuthorRanks: AuthorRank[] = authors.map(a_i => ({
    author: a_i,
    rank: InfRank(a_i),
    avgSentiment: a_i.sentiments.reduce((sum, i) => sum + i, 0) / a_i.sentiments.length
  }))
  
  let authorRanks = [ initialAuthorRanks ] // k = 0
  
  let convergence = false
  
  let kMax = 1 // max nr of rounds/iterations
  let k = 0
  
  /**
   * 4. run infrank
   */
  while (!convergence && k < kMax - 1) {
    k++
  
    const lastIndex = authorRanks.length - 1 // k - 1
    const previousAuthorResults: AuthorRank[] = authorRanks[lastIndex];
    let currentAuthorRanks: AuthorRank[] = []
  
    authors.forEach(a_i => {
      const previousAuthorRank = previousAuthorResults.find(ar => ar.author.id === a_i.id);
  
      if (!previousAuthorRank) {
        return; // shouldn't happen
      }
  
      const dampedResult = {
        author: a_i,
        rank: (1-d) * P(a_i,) / authors.length * w_r_sum(a_i, previousAuthorRank.rank)
      }
  
      // normalization
      const normalizedResult = {
        author: a_i,
        rank: dampedResult.rank / previousAuthorResults.reduce((sum, ar) => sum + ar.rank, 0)
      }

      currentAuthorRanks = [
        ...currentAuthorRanks,
        {
          ...normalizedResult,
          avgSentiment: previousAuthorRank.avgSentiment,
        },
      ]
    })
  
    // update author ranks
    authorRanks = [
      ...authorRanks,
      currentAuthorRanks,
    ]
  
    // check convergence
    if (previousAuthorResults[0].rank === currentAuthorRanks[0].rank) {
      convergence = true
    }
  }

  // sort results by rank
  authorRanks = [ ...authorRanks.map(r => r.sort(sortAuthorRanksDescending)) ]
  
  console.log(`Convergence found. 🎊 \nNumber of rounds: ${authorRanks.length}\nAll results: `, authorRanks)
  console.log('Convergent results: ', authorRanks[authorRanks.length - 1])
  // console.log(`Ranking initial round: \n 1. ${authorRanks[0][0].author}`);
  // console.log(`Ranking initial round: \n 1. ${authorRanks[0][0].author.id}`);
  // console.log(`Ranking latest round: \n 1. ${authorRanks[authorRanks.length-1][0].author.id}`);

  // persist
  const infrankFile = './out/infrank.json';
  const authorsWithoutId = authorRanks[authorRanks.length - 1].map(ar => ({
    rank: ar.rank,
    author: ar.author.nickname,
    avgSentiment: ar.avgSentiment,
    isOrganisation: allAuthors.find(a => a.userName === ar.author.nickname).isOrg === '1'
  }))
  const organizationalAuthorsWithoutId = authorsWithoutId.filter(a => a.isOrganisation)
  jsonfile.writeFile(infrankFile, organizationalAuthorsWithoutId, err => {
    if (err) console.error(err);
  })

  const retweetEdgeFile = './out/retweet-edges.json'
  jsonfile.writeFile(retweetEdgeFile, retweetEdges.map(x => ({ retweeter: x.source.id, author: x.target.id })), err => {
    if (err) console.error(err);
  })

  mongoClient.close()
}

analyze()
