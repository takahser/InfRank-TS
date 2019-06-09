import { Author, Association, AssociationType, Tweet, AuthorRank } from "./domain";

// mocked data
const donald: Author = {
  id: '1',
  nickname: 'donald',
}
const nigel: Author = {
  id: '2',
  nickname: 'nigel',
}
const mickey: Author = {
  id: '3',
  nickname: 'mickey'
}

const tweets = [{
  id: 'd001',
  author: donald,
  retweeter: [
    nigel,
    mickey,
  ]
},{
  id: 'd002',
  author: donald,
  retweeter: [
    nigel,
    mickey,
  ]
},{
  id: 'd003',
  author: donald,
  retweeter: [
    nigel,
    mickey,
  ]
},{
  id: 'd004',
  author: donald,
  retweeter: [
    nigel,
    mickey,
  ]
},{
  id: 'n005',
  author: nigel,
  retweeter: [
    donald,
    mickey,
  ]
},{
  id: 'n006',
  author: nigel,
  retweeter: [
    donald,
    mickey,
  ]
},{
  id: '007',
  author: mickey,
  retweeter: [
    donald,
    nigel,
  ]
}]

/**
 * global variables
 */
const d = 0.85

// const tweets: Tweet[] = []

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
  if (authors.find(a => a.id === tweet.author.id)) {
    return authors
  }
  return [
    ...authors,
    tweet.author,
  ]
}, [])

/**
 * methods
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

const P = (author: Author) => I(author, AssociationType.Retweeting).length

const InfRank = (author: Author) => P(author) / authors.length

const w_r = (a_i: Author, a_j: Author) =>
  T(a_i)
    .filter(
      t => R(a_j).find(r => r.id === t.id)
    )
  .length / T(a_i).length

const w_r_sum = (a_i: Author, previousRank: number) => I(a_i, AssociationType.Retweeting)
  .reduce((sum, a_j) =>
    sum + w_r(a_j, a_i) * previousRank / O(a_j, AssociationType.Retweeting).length
  , 0)

// without using d
// k = 0
const initialAuthorRanks: AuthorRank[] = authors.map(a_i => ({
  author: a_i,
  rank: InfRank(a_i),
}))

let authorRanks = [ initialAuthorRanks ] // k = 0

let convergence = false

while (!convergence) {
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
      normalizedResult,
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

console.log(`Convergence found. 🎊 \nNumber of rounds: ${authorRanks.length}\nAll results: `, authorRanks)
console.log('Convergent results: ', authorRanks[authorRanks.length - 1])
