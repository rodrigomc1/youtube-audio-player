import { ThemeProvider, CssBaseline } from '@mui/material'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'

import client from './graphql/client'
import theme from './theme'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </ApolloProvider>
)
