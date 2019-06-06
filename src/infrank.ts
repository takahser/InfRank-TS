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

let currentResults: number[] = []
authors.forEach(a_i => {
  const firstResult = InfK(a_i)
  currentResults = [
    ...currentResults,
    firstResult,
  ]
})
