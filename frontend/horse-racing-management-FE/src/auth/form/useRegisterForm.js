import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import { sendVerificationOtp, verifyEmail } from '../../api/emailVerifyApi';

export const FIELDS = [
  { name: 'fullName',        label: 'Full Name',        type: 'text',     placeholder: 'John Doe',         full: true },
  { name: 'username',        label: 'Username',         type: 'text',     placeholder: 'johndoe' },
  { name: 'email',           label: 'Email',            type: 'email',    placeholder: 'john@example.com' },
  { name: 'phone',           label: 'Phone',            type: 'tel',      placeholder: '+84 234 567 890' },
  { name: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••' },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
];

const REQUIRED_LABELS = {
  fullName:        'Full Name',
  username:        'Username',
  email:           'Email',
  phone:           'Phone',
  password:        'Password',
  confirmPassword: 'Confirm Password',
};

const validate = (name, value, form) => {
  if (!value || !value.trim())
    return `${REQUIRED_LABELS[name]} is required`;
  if (name === 'password' && value.length < 8)
    return 'Password must be at least 8 characters';
  if (name === 'confirmPassword' && value !== form.password)
    return 'Passwords do not match';
  if (name === 'phone' && !/^[0-9]{10,11}$/.test(value))
    return 'Phone must be 10–11 digits';
  return '';
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegisterForm(apiRole) {
  const navigate = useNavigate();
  const [form, setForm]         = useState(Object.fromEntries(FIELDS.map((f) => [f.name, ''])));
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const [emailVerified, setEmailVerified]     = useState(false);
  const [showVerifyCard, setShowVerifyCard]   = useState(false);
  const [sendOtpLoading, setSendOtpLoading]   = useState(false);
  const [otp, setOtp]                         = useState('');
  const [otpError, setOtpError]               = useState('');
  const [otpLoading, setOtpLoading]           = useState(false);
  const [resendLoading, setResendLoading]     = useState(false);
  const [resendSuccess, setResendSuccess]     = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setApiError('');
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, updated) }));
    if (name === 'password') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: updated.confirmPassword
          ? validate('confirmPassword', updated.confirmPassword, updated)
          : '',
      }));
    }
    if (name === 'email') {
      setEmailVerified(false);
      setShowVerifyCard(false);
      setOtp('');
      setOtpError('');
      setResendSuccess(false);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, form) }));
  };

  const handleVerifyClick = async () => {
    if (!form.email || !form.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!EMAIL_REGEX.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    setSendOtpLoading(true);
    try {
      await sendVerificationOtp(form.email);
      setShowVerifyCard(true);
      setOtp('');
      setOtpError('');
      setResendSuccess(false);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: err.response?.data?.message || 'Failed to send verification code',
      }));
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    setOtpError('');
  };

  const handleConfirmVerify = async () => {
    if (otp.replace(/\s/g, '').length < 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    setOtpLoading(true);
    try {
      await verifyEmail(form.email, otp);
      setEmailVerified(true);
      setShowVerifyCard(false);
      setErrors((prev) => ({ ...prev, email: '' }));
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setOtpError('');
    try {
      await sendVerificationOtp(form.email);
      setResendSuccess(true);
    } catch {
      setOtpError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    FIELDS.forEach((f) => {
      const err = validate(f.name, form[f.name], form);
      if (err) newErrors[f.name] = err;
    });
    if (!newErrors.email && !emailVerified) {
      newErrors.email = 'Email has not been verified';
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...rest } = form;
      await register({ ...rest, role: apiRole });
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    form, errors, loading, apiError, handleChange, handleBlur, handleSubmit,
    emailVerified, showVerifyCard, sendOtpLoading,
    otp, otpError, otpLoading, resendLoading, resendSuccess,
    handleVerifyClick, handleOtpChange, handleConfirmVerify, handleResendOtp,
  };
}
