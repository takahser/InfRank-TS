/**
 * global variables
 */
const d = 0.83

const tweets: Tweet[] = []

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
  .filter(e => e.source === author && e.label === label)
  .map(e => e.source)

const I = (author: Author, label: AssociationType) => retweetEdges
  .filter(e => e.target === author && e.label === label)
  .map(e => e.target)

const T = (author: Author) => tweets
  .filter(t => t.author === author)

const R = (source: Author): Tweet[] => retweetEdges
  .filter(e => e.source === source)
    .flatMap(e =>
      tweets.filter(t =>
        t.author === e.source
      )
    )

const P = (author: Author) => I(author, AssociationType.Following).length

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
const initialAuthorRanks: AuthorRank[] = authors.map(a_i => ({
  author: a_i,
  rank: InfRank(a_i),
}))

let dampedAuthorRanks: AuthorRank[] = []
let normalizedAuthorRanks: AuthorRank[] = []

authors.forEach(a_i => {
  const previousAuthorRank = initialAuthorRanks.find(ar => ar.author.id === a_i.id);

  if (!previousAuthorRank) {
    return; // shouldn't happen
  }

  const dampedResult = {
    author: a_i,
    rank: (1-d) * P(a_i,) / authors.length * w_r_sum(a_i, previousAuthorRank.rank)
  }
  dampedAuthorRanks = [
    ...dampedAuthorRanks,
    dampedResult
  ]

  // normalization
  const normalizedResult = {
    author: a_i,
    rank: dampedResult.rank / dampedAuthorRanks.reduce((sum, ar) => sum + ar.rank, 0)
  }
  normalizedAuthorRanks = [
    ...normalizedAuthorRanks,
    normalizedResult,
  ]
})
