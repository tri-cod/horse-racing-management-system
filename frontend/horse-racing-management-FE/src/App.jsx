import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RacePage from './pages/RacePage'
import RaceHorsePage from './pages/RaceHorsePage'
import { ProtectedRoute } from './router/ProtectedRoute'

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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/races" element={<Layout><RacePage /></Layout>} />
      <Route
        path="/race-horse"
        element={
          <Layout>
            <ProtectedRoute>
              <RaceHorsePage />
            </ProtectedRoute>
          </Layout>
        }
      />
    </Routes>
  )
}
