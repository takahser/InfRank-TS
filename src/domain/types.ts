/**
 * data structures
 */
// source ~ u_i
// target ~ u_j
export enum AssociationType {
  Following, // source follows target
  Retweeting, // source retweets target
  Metioning, // source mentions target
}

export interface Author {
  id: string,
  nickname: string,
  sentiments: number[],
}

export interface Association {
  source: Author,
  target: Author,
  label: AssociationType,
}

export interface Tweet {
  id: string,
  author: Author,
  sentiment: number,
  retweeter: Author[], // retweeter := all author that retweeted >= 1 tweet of the author
}

export interface AuthorRank {
  author: Author,
  rank: number,
  avgSentiment: number,
}
