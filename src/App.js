import { Grid, Hidden, useMediaQuery } from '@mui/material'
import AddSong from './components/AddSong'
import Header from './components/Header'
import SongList from './components/SongList'
import SongPlayer from './components/SongPlayer'
import songReducer from './reducer'
import React from 'react'

export const SongContext = React.createContext({
  song: {
    id: '9dfc9461-b6a3-4828-a21b-9c0c7a377308',
    title: 'LUNE',
    artist: 'MOON',
    thumbnail: 'https://i.ytimg.com/vi/--ZtUFsIgMk/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=--ZtUFsIgMk&ab_channel=ElectronicGems',
    duration: 250,
  },
  isPlaying: false,
})

function App() {
  const initialSongState = React.useContext(SongContext)
  const [state, dispatch] = React.useReducer(songReducer, initialSongState)

  const greaterThanSm = useMediaQuery(theme => theme.breakpoints.up('sm'))
  const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up('md'))

  return (
    <SongContext.Provider value={{ state, dispatch }}>
      <Hidden only='xs'>
        <Header />
      </Hidden>
      <Grid
        container
        spacing={3}
        sx={{ paddingTop: greaterThanSm ? '80px' : '10px' }}
      >
        <Grid item xs={12} md={7}>
          <AddSong />
          <SongList />
        </Grid>
        <Grid
          item
          xs={12}
          md={5}
          sx={
            greaterThanMd
              ? { position: 'fixed', width: '100%', right: '0', top: '70px' }
              : {
                  position: 'fixed',
                  width: '100%',
                  left: 0,
                  bottom: 0,
                }
          }
        >
          <SongPlayer />
        </Grid>
      </Grid>
    </SongContext.Provider>
  )
}

export default App
