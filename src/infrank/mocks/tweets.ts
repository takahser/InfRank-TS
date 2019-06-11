import { Author } from '../../domain';

const donald: Author = {
  id: '1',
  nickname: 'donald',
  sentiments: [],
}
const nigel: Author = {
  id: '2',
  nickname: 'nigel',
  sentiments: [],
}
const mickey: Author = {
  id: '3',
  nickname: 'mickey',
  sentiments: [],
}
const ronald: Author = {
  id: '4',
  nickname: 'ronald',
  sentiments: [],
}

export const tweets = [{
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
  id: 'm007',
  author: mickey,
  retweeter: [
    donald,
    nigel,
  ]
}, {
  id: 'r008',
  author: ronald,
  retweeter: []
}]
