import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { LoginPayload, User } from '@/types';

export function useLogin() {
 const navigate = useNavigate();
 // Improvement: use the exported useAuth hook instead of useContext(AuthContext) directly
 const { login: contextLogin } = useAuth();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const handleLogin = useCallback(
 async (credentials: LoginPayload): Promise<User | null> => {
 setError('');
 setSuccess('');
 setLoading(true);
 try {
 const result = await contextLogin(credentials);
 setSuccess(`Welcome back, ${result.fullName ?? result.username}!`);
 navigate('/');
 return result;
 } catch (e: unknown) {
 const err = e as { response?: { data?: { message?: string } }; message?: string };
 setError(err.response?.data?.message ?? err.message ?? 'Login failed. Please try again.');
 return null;
 } finally {
 setLoading(false);
 }
 },
 [contextLogin, navigate],
 );

 return { loading, error, success, handleLogin };
}
