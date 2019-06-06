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

const R = (source: Author, target: Author): Association[] => retweetEdges
  .filter(r => r.source === source && r.target === target)

const P = (author: Author) => I(author, AssociationType.Following).length

const InfRank = (author: Author) => P(author) / authors.length

