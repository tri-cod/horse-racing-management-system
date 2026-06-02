import { Routes, Route } from 'react-router-dom'
import Login from './auth/login.jsx'
import Register from './auth/register.jsx'
import ForgotPassword from './auth/forgot_password.jsx'

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Login />} />
        </Routes>
    )
}