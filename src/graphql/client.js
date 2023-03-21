import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  gql,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'
import { setContext } from '@apollo/client/link/context'
import { GET_QUEUED_SONGS } from './queries'

/* const httpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URI,
})

const authLink = setContext((_, { headers }) => {
  const token =
    process.env.REACT_APP_X_HASURA_ADMIN_SECRET
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': token,
    },
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
}) */

const authLink = setContext((_, { headers }) => {
  const token = process.env.REACT_APP_X_HASURA_ADMIN_SECRET
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': token,
    },
  }
})

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URI,
})

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_HASURA_WEBSOCKET_URI,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        'x-hasura-admin-secret': process.env.REACT_APP_X_HASURA_ADMIN_SECRET,
      },
    },
  },
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  typeDefs: gql`
    type Song {
      id: uuid!
      title: String!
      artist: String!
      thumbnail: String!
      duration: Float!
      url: String!
    }

    input SongInput {
      id: uuid!
      title: String!
      artist: String!
      thumbnail: String!
      duration: Float!
      url: String!
    }

    type Query {
      queue: [Song]!
    }

    type Mutation {
      addOrRemoveFromQueue(input: SongInput!): [Song]!
    }
  `,

  resolvers: {
    Mutation: {
      addOrRemoveFromQueue: (_, { input }, { cache }) => {
        const queryResult = cache.readQuery({
          query: GET_QUEUED_SONGS,
        })

        if (queryResult) {
          const { queue } = queryResult
          const isInqueue = queue.some(song => song.id === input.id)
          const newQueue = isInqueue
            ? queue.filter(song => song.id !== input.id)
            : [...queue, input]
          cache.writeQuery({
            query: GET_QUEUED_SONGS,
            data: { queue: newQueue },
          })
          return newQueue
        }
        return []
      },
    },
  },
})

client.writeQuery({
  query: gql`
    query getQueue {
      queue
    }
  `,
  data: {
    queue: Boolean(localStorage.getItem('queue'))
      ? JSON.parse(localStorage.getItem('queue'))
      : [],
  },
})

export default client
