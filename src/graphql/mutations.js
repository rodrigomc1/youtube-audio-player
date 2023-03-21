import { gql } from '@apollo/client'

export const ADD_OR_REMOVE_FROM_QUEUE = gql`
  mutation addOrRemoveFromQueue($input: SongInput!) {
    addOrRemoveFromQueue(input: $input) @client
  }
`

export const ADD_SONG = gql`
  mutation addSong(
    $artist: String!
    $title: String!
    $url: String!
    $thumbnail: String!
    $duration: Float!
  ) {
    insert_songs(
      objects: {
        artist: $artist
        title: $title
        url: $url
        duration: $duration
        thumbnail: $thumbnail
      }
    ) {
      affected_rows
    }
  }
`
