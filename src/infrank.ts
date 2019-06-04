
/**
 * global variables
 */
const edges: Association[] = [];
const tweets: Tweet[] = [];
const retweetEdges: Association[] = tweets
  .flatMap(t =>
    t.retweeter.map(
        r => ({
          source: r,
          target: t.author,
          label: AssociationType.Retweeting,
        })
      ))

/**
 * methods
 */
const O = (author: Author, label: AssociationType) => edges
  .filter(e => e.source === author && e.label === label)

const I = (author: Author, label: AssociationType) => edges
  .filter(e => e.target === author && e.label === label)

const T = (author: Author) => tweets
  .filter(t => t.author === author)

const R = (source: Author, target: Author): Association[] => retweetEdges
  .filter(r => r.source === source && r.target === target)
