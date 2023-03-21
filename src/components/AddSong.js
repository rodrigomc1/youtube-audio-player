import { useMutation } from '@apollo/client'
import { AddBoxOutlined, Link } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material'
import React from 'react'
import ReactPlayer from 'react-player'
import SoundCloudPlayer from 'react-player/soundcloud'
import YouTubePlayer from 'react-player/youtube'
import { ADD_SONG } from '../graphql/mutations'

const DEFAULT_SONG = {
  duration: 0,
  title: '',
  artist: '',
  thumbnail: '',
}

const AddSong = () => {
  const [addSong, { error }] = useMutation(ADD_SONG)
  const [dialog, setDialog] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [playable, setPlayable] = React.useState(false)
  const [song, setSong] = React.useState(DEFAULT_SONG)

  React.useEffect(() => {
    const isPlayable =
      SoundCloudPlayer.canPlay(url) || YouTubePlayer.canPlay(url)
    setPlayable(isPlayable)
  }, [url])

  function handleChangeSong(event) {
    setSong(prevSong => ({
      ...prevSong,
      [event.target.name]: event.target.value,
    }))
  }

  function handleCloseDialog() {
    setDialog(false)
  }

  async function handleEditSong({ player }) {
    const nestedPlayer = player.player.player
    let songData
    if (nestedPlayer.getVideoData) {
      songData = getYoutubeInfo(nestedPlayer)
    } else if (nestedPlayer.getCurrentSound) {
      songData = await getSoundcloudInfo(nestedPlayer)
    }
    setSong({ ...songData, url })
  }

  async function handleAddSong() {
    try {
      const { url, thumbnail, duration, title, artist } = song

      await addSong({
        variables: {
          url: url.length > 0 ? url : null,
          thumbnail: thumbnail.length > 0 ? thumbnail : null,
          duration: duration > 0 ? duration : null,
          title: title.length > 0 ? title : null,
          artist: artist.length > 0 ? artist : null,
        },
      })

      handleCloseDialog()
      setSong(DEFAULT_SONG)
      setUrl('')
    } catch (error) {
      console.error('Error adding song', error)
    }
  }

  function getYoutubeInfo(player) {
    const duration = player.getDuration()
    const { title, video_id, author } = player.getVideoData()
    const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`
    return {
      duration,
      title,
      artist: author,
      thumbnail,
    }
  }

  function getSoundcloudInfo(player) {
    return new Promise(resolve => {
      player.getCurrentSound(songData => {
        if (songData) {
          resolve({
            duration: Number(songData.duration / 1000),
            title: songData.title,
            artist: songData.user.username,
            thumbnail: songData.artwork_url.replace('-large', '-t500x500'),
          })
        }
      })
    })
  }

  function handleError(field) {
    return error?.graphQLErrors[0]?.extensions?.path.includes(field)
  }

  const { thumbnail, title, artist } = song

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Dialog
        open={dialog}
        onClose={handleCloseDialog}
        sx={{ textAlign: 'center' }}
      >
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <img style={{ width: '90%' }} src={thumbnail} alt='Song thumbnail' />

          <TextField
            value={title}
            onChange={handleChangeSong}
            variant='standard'
            margin='dense'
            name='title'
            label='Title'
            fullWidth
            error={handleError('title')}
            helperText={handleError('title') && 'Fill out field'}
          />
          <TextField
            value={artist}
            onChange={handleChangeSong}
            variant='standard'
            margin='dense'
            name='artist'
            label='Artist'
            fullWidth
            error={handleError('artist')}
            helperText={handleError('artist') && 'Fill out field'}
          />
          <TextField
            value={thumbnail}
            onChange={handleChangeSong}
            variant='standard'
            margin='dense'
            name='thumbnail'
            label='Thumbnail'
            fullWidth
            error={handleError('thumbnail')}
            helperText={handleError('thumbnail') && 'Fill out field'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleAddSong}
            color='primary'
            variant='outlined'
            sx={{ margin: theme => theme.spacing(1) }}
          >
            Add Song
          </Button>
        </DialogActions>
      </Dialog>
      <TextField
        variant='standard'
        placeholder='Add Youtube or Soundcloud Url'
        onChange={event => setUrl(event.target.value)}
        value={url}
        fullWidth
        margin='normal'
        type='url'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Link />
            </InputAdornment>
          ),
        }}
        sx={{ margin: theme => theme.spacing(1) }}
      />
      <Button
        disabled={!playable}
        onClick={() => setDialog(true)}
        variant='contained'
        color='primary'
        endIcon={<AddBoxOutlined />}
        sx={{ margin: theme => theme.spacing(1) }}
      >
        Add
      </Button>
      <ReactPlayer url={url} hidden onReady={handleEditSong} />
    </div>
  )
}

export default AddSong
