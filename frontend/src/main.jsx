import { StrictMode } from 'react'
import './i18n';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setAuthToken } from './services/api.js'

// Rehydrate auth token on load
const existingToken = localStorage.getItem('auth_token')
if (existingToken) {
  setAuthToken(existingToken)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
