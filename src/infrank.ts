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

const InfK = (author: Author) => P(author) / authors.length

const w_r = (a_i: Author, a_j: Author) =>
  T(a_i)
    .filter(
      t => R(a_j).find(r => r.id === t.id)
    )
  .length / T(a_i).length

// without using d
let naiveResults: number[] = []
let dampedResults: number[] = []

authors.forEach(a_i => {
  const naiveResult = InfK(a_i)
  naiveResults = [
    ...naiveResults,
    naiveResult,
  ]

  const w_r_sum = I(a_i, AssociationType.Retweeting)
    .reduce((sum, a_j) =>
      // TODO 1:
      // O(a_j, AssociationType.Retweeting) is NOT a number but from type Author[]

      // TODO 2:
      // What is Inf^k-1? Here we use InfK instead
      sum + w_r(a_j, a_i) * InfK(a_j) / O(a_j, AssociationType.Retweeting).length
    , 0)
  const damptedResult = (1-d) * P(a_i,) / authors.length * w_r_sum
  dampedResults = [
    ...dampedResults,
    damptedResult
  ]

  // normalization
  // TODO (?)
})
