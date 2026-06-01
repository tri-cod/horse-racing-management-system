import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Register from './auth/register.jsx'
import Login from './auth/login.jsx'
import ForgotPassword from './auth/forgot_password.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>                         
      <Routes>                            
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />  
        <Route path="*" element={<Login />} />   {/* mặc định vào login */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
