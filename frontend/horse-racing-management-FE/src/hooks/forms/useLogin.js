import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export function useLogin() {
  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = useCallback(async (credentials) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await contextLogin(credentials);
      setSuccess(`Welcome back, ${result.fullName}!`);
      navigate('/');
      return result;
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [contextLogin, navigate]);

  return {
    loading,
    error,
    success,
    handleLogin,
  };
}
