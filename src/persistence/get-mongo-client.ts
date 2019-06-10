import { url } from '.';

const MongoClient = require('mongodb').MongoClient;
const jsonfile = require('jsonfile')

export const getMongoClient = async () => MongoClient
  .connect((url)).then(async client => {
    console.log('Connected successfully to mongo db: ', url)
  
    return client
  })
