import { useMutation, useSubscription } from '@apollo/client'
import { Pause, PlayArrow, Save } from '@mui/icons-material'
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material'
import React from 'react'
import { SongContext } from '../App'
import { ADD_OR_REMOVE_FROM_QUEUE } from '../graphql/mutations'
import { GET_SONGS } from '../graphql/subscriptions'

const SongList = () => {
  const { data, loading, error } = useSubscription(GET_SONGS)

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '50px',
        }}
      >
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    console.log(error)
    return <div>Error fetching songs</div>
  }

  return (
    <div>
      {data.songs.map(song => (
        <Song key={song.id} song={song} />
      ))}
    </div>
  )
}

function Song({ song }) {
  const { id } = song
  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
    onCompleted: data => {
      localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
    },
  })
  const [currentSongPlaying, setCurrentSongPlaying] = React.useState(false)
  const { state, dispatch } = React.useContext(SongContext)
  const { title, artist, thumbnail } = song

  React.useEffect(() => {
    const isSongPlaying = state.isPlaying && id === state.song.id
    setCurrentSongPlaying(isSongPlaying)
  }, [id, state.song.id, state.isPlaying])

  function handleTogglePlay() {
    dispatch({ type: 'SET_SONG', payload: { song } })
    dispatch(
      currentSongPlaying ? { type: 'PAUSE_SONG' } : { type: 'PLAY_SONG' }
    )
  }

  function handleAddOrRemoveFromQueue() {
    addOrRemoveFromQueue({
      variables: { input: { ...song, __typename: 'Song' } },
    })
  }

  return (
    <Card
      sx={{
        margin: theme => theme.spacing(3),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CardMedia
          image={thumbnail}
          sx={{
            objectFit: 'cover',
            width: '140px',
            height: '140px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <CardContent>
            <Typography gutterBottom variant='h5' component='h2'>
              {title}
            </Typography>
            <Typography
              gutterBottom
              variant='body1'
              component='p'
              color='textSecondary'
            >
              {artist}
            </Typography>
          </CardContent>
          <CardActions>
            <IconButton onClick={handleTogglePlay} size='small' color='primary'>
              {currentSongPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton
              onClick={handleAddOrRemoveFromQueue}
              size='small'
              color='secondary'
            >
              <Save />
            </IconButton>
          </CardActions>
        </div>
      </div>
    </Card>
  )
}

export default SongList
