import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './auth/login'
import ForgotPassword from './auth/forgotPassword'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App