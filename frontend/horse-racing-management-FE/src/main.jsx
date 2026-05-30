import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Register from './auth/register.jsx'
import Login from './auth/login.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    < Login/>
  </StrictMode>,
)
