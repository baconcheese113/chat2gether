import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import ApolloClient, { InMemoryCache } from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'
import './index.css'
import App from './components/App'
import { darkTheme } from './helpers/themes'

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
        <App />
      </ThemeProvider>
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById('root'),
)
