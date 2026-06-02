import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './auth/homePage'
import Register from './auth/register'
import Login from './auth/login'
import ForgotPassword from './auth/forgot_password'

function Layout({ children }) {
  return (
    <div className="App">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  )
}
