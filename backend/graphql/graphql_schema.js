// backend/graphql/graphql_schema.js
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Resource {
    id: Int!
    name: String!
    description: String
  }

  type Query {
    getResource(id: Int!): Resource
    getAllResources: [Resource] # For convenience, though not directly benchmarked
  }

  type Mutation {
    createResource(name: String!, description: String): Resource!
  }

  type Subscription {
    streamResources(count: Int!, delayMs: Int = 10): Resource # In a real app, this would use PubSub
  }
`);

module.exports = schema;