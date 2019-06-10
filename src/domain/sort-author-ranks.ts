import { AuthorRank } from '.';

export const sortAuthorRanksDescending: ((a: AuthorRank, b: AuthorRank) => number) | undefined = (a, b) => b.rank - a.rank;
