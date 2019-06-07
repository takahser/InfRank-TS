/**
 * data structures
 */
// source ~ u_i
// target ~ u_j
enum AssociationType {
  Following, // source follows target
  Retweeting, // source retweets target
  Metioning, // source mentions target
}

interface Author {
  id: string,
  nickname: string,
}

interface Association {
  source: Author,
  target: Author,
  label: AssociationType,
}

interface Tweet {
  id: string,
  author: Author,
  retweeter: Author[], // retweeter := all author that retweeted >= 1 tweet of the author
}

interface AuthorRank {
  author: Author,
  rank: number,
}
