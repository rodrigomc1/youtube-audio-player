import React from 'react'
import { AppBar, Toolbar, Typography } from '@mui/material'
import { HeadsetTwoTone } from '@mui/icons-material'

const Header = () => {
  return (
    <AppBar color='primary' position='fixed' enableColorOnDark>
      <Toolbar>
        <HeadsetTwoTone />
        <Typography
          sx={{ marginLeft: theme => theme.spacing(2) }}
          variant='h6'
          component='h1'
        >
          Apollo Music Share
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header
