import React from 'react'
import * as Sentry from '@sentry/browser'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import ApolloClient, { InMemoryCache } from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'
import StylesProvider from '@material-ui/styles/StylesProvider'
import './index.css'
import App from './components/App'
import { darkTheme } from './helpers/themes'

Sentry.init({ dsn: 'https://cfc156ae965449309801e5a8973ece80@sentry.io/1493191' })

const client = new ApolloClient({
  // uri: /* '/', */ 'http://localhost:4000', // removed to default to '/graphql'
  cache: new InMemoryCache(),
  request: operation => {
    operation.setContext({
      fetchOptions: {
        credentials: 'include',
      },
    })
  },
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ApolloHooksProvider client={client}>
      <ThemeProvider theme={darkTheme}>
        <StylesProvider injectFirst>
          <App />
        </StylesProvider>
      </ThemeProvider>
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById('root'),
)
