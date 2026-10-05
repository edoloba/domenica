import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client'
import { StrictMode } from 'react'
import './index.css'
import App from './App.jsx'

const client = new ApolloClient({
  link: new HttpLink({ uri: `${import.meta.env.VITE_WP_URL}/graphql` }),
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
)
