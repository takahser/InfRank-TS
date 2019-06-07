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

const w_r_sum = (a_i: Author) => I(a_i, AssociationType.Retweeting)
  .reduce((sum, a_j) =>
    // TODO 1:
    // O(a_j, AssociationType.Retweeting) is NOT a number but from type Author[]

    // TODO 2:
    // What is Inf^k-1? Here we use InfK instead
    sum + w_r(a_j, a_i) * InfRank(a_j) / O(a_j, AssociationType.Retweeting).length
  , 0)

// without using d
const initialResults: number[] = authors.map(a_i => InfRank(a_i))

let dampedResults: number[] = []
let normalizedResults: number[] = []

authors.forEach(a_i => {
  const dampedResult = (1-d) * P(a_i,) / authors.length * w_r_sum(a_i)
  dampedResults = [
    ...dampedResults,
    dampedResult
  ]

  // normalization
  // TODO (?)
  const normalizedResult = dampedResult / dampedResults.reduce((sum, r) => sum + r, 0)
  normalizedResults = [
    ...normalizedResults,
    normalizedResult,
  ]
})
