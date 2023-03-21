import { Box } from '@mui/system'
import { Typography, Avatar, IconButton, useMediaQuery } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { useMutation } from '@apollo/client'
import { ADD_OR_REMOVE_FROM_QUEUE } from '../graphql/mutations'

const QueuedSongList = ({ queue }) => {
  const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up('md'))

  return (
    greaterThanMd && (
      <Box
        sx={{
          margin: '10px 0',
        }}
      >
        <Typography color='textSecondary' variant='button'>
          QUEUE ({queue.length})
        </Typography>
        {queue.map((song, i) => (
          <QueuedSong key={i} song={song} />
        ))}
      </Box>
    )
  )
}

function QueuedSong({ song }) {
  const { thumbnail, artist, title } = song
  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
    onCompleted: data => {
      localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
    },
  })

  function handleAddOrRemoveFromQueue() {
    addOrRemoveFromQueue({
      variables: { input: { ...song, __typename: 'Song' } },
    })
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: '50px auto 50px',
        gap: '12px',
        alignItems: 'center',
        marginTop: '10px',
      }}
    >
      <Avatar
        sx={{
          width: '44px',
          height: '44px',
        }}
        src={thumbnail}
        alt='Song thumbnail'
      />
      <Box
        sx={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>
        <Typography
          color='textSecondary'
          variant='body2'
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {artist}
        </Typography>
      </Box>
      <IconButton onClick={handleAddOrRemoveFromQueue}>
        <Delete color='error' />
      </IconButton>
    </Box>
  )
}

export default QueuedSongList
