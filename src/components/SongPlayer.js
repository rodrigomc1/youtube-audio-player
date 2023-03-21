import React from 'react'
import { Pause, PlayArrow, SkipNext, SkipPrevious } from '@mui/icons-material'
import {
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Slider,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useQuery } from '@apollo/client'
import ReactPlayer from 'react-player'

import { SongContext } from '../App'
import { GET_QUEUED_SONGS } from '../graphql/queries'
import QueuedSongList from './QueuedSongList'

const SongPlayer = () => {
  const { data } = useQuery(GET_QUEUED_SONGS)
  const reactPlayerRef = React.useRef()
  const { state, dispatch } = React.useContext(SongContext)
  const [played, setPlayed] = React.useState(0)
  const [playedSeconds, setPlayedSeconds] = React.useState(0)
  const [seeking, setSeeking] = React.useState(false)
  const [positionInQueue, setPosititonInQueue] = React.useState(0)

  React.useEffect(() => {
    const songIndex = data.queue.findIndex(song => song.id === state.song.id)
    setPosititonInQueue(songIndex)
  }, [data.queue, state.song.id])

  React.useEffect(() => {
    const nextSong = data.queue[positionInQueue + 1]
    if (played >= 0.99 && nextSong) {
      setPlayed(0)
      dispatch({ type: 'SET_SONG', payload: { song: nextSong } })
    }
  }, [data.queue, played, dispatch, positionInQueue])

  function handleTogglePlay() {
    dispatch(state.isPlaying ? { type: 'PAUSE_SONG' } : { type: 'PLAY_SONG' })
  }

  function handleProgressChange(event, newValue) {
    setPlayed(newValue)
  }

  function handleSeekMouseDown() {
    setSeeking(true)
  }

  function handleSeekMouseUp() {
    setSeeking(false)
    reactPlayerRef.current.seekTo(played)
  }

  function formatDuration(seconds) {
    return new Date(seconds * 1000).toISOString().substring(11, 19)
  }

  function handlePlayNextSong() {
    const nextSong = data.queue[positionInQueue + 1]
    if (nextSong) {
      dispatch({ type: 'SET_SONG', payload: { song: nextSong } })
    }
  }

  function handlePlayPrevSong() {
    const prevSong = data.queue[positionInQueue - 1]
    if (prevSong) {
      dispatch({ type: 'SET_SONG', payload: { song: prevSong } })
    }
  }

  return (
    <>
      <Card
        variant='outlined'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 15px',
          }}
        >
          <CardContent
            sx={{
              flex: '1 0 auto',
            }}
          >
            <Typography variant='h5' component='h3'>
              {state.song.title}
            </Typography>
            <Typography variant='subtitle1' component='p' color='textSecondary'>
              {state.song.artist}
            </Typography>
          </CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: theme => theme.spacing(1),
              paddingRight: theme => theme.spacing(1),
            }}
          >
            <IconButton onClick={handlePlayPrevSong}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={handleTogglePlay}>
              {state.isPlaying ? (
                <Pause sx={{ height: '38px', width: '38px' }} />
              ) : (
                <PlayArrow sx={{ height: '38px', width: '38px' }} />
              )}
            </IconButton>
            <IconButton onClick={handlePlayNextSong}>
              <SkipNext />
            </IconButton>
            <Typography variant='subtitle1' component='p' color='textSecondary'>
              {formatDuration(playedSeconds)}
            </Typography>
          </Box>
          <Slider
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            onChange={handleProgressChange}
            value={played}
            type='range'
            min={0}
            max={1}
            step={0.01}
          />
        </Box>
        <ReactPlayer
          ref={reactPlayerRef}
          onProgress={({ played, playedSeconds }) => {
            if (!seeking) {
              setPlayed(played)
              setPlayedSeconds(playedSeconds)
            }
          }}
          url={state.song.url}
          playing={state.isPlaying}
          hidden
          config={{
            youtube: {
              playerVars: {
                origin: 'http://localhost:3000',
                autoplay: 1,
                controls: 0,
                autohide: 1,
                wmode: 'opaque',
              },
            },
          }}
        />
        <CardMedia sx={{ width: '150px' }} image={state.song.thumbnail} />
      </Card>
      <QueuedSongList queue={data.queue} />
    </>
  )
}

export default SongPlayer
