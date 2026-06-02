import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, sendVerificationOtp, verifyEmail } from '../../api/authApi';

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

export function useRegisterForm(apiRole) {
  const navigate = useNavigate();
  const [form, setForm]           = useState(Object.fromEntries(FIELDS.map((f) => [f.name, ''])));
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');

  const [step, setStep]               = useState('form'); // 'form' | 'verify'
  const [otp, setOtp]                 = useState('');
  const [otpError, setOtpError]       = useState('');
  const [otpLoading, setOtpLoading]   = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    FIELDS.forEach((f) => {
      const err = validate(f.name, form[f.name], form);
      if (err) newErrors[f.name] = err;
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...rest } = form;
      await register({ ...rest, role: apiRole });
      await sendVerificationOtp(form.email);
      setStep('verify');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    setOtpError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setOtpError('Please enter the verification code'); return; }

    setOtpLoading(true);
    try {
      await verifyEmail(form.email, otp);
      navigate('/login');
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

  return {
    form, errors, loading, apiError, handleChange, handleBlur, handleSubmit,
    step,
    otp, otpError, otpLoading, resendLoading, resendSuccess,
    handleOtpChange, handleVerify, handleResendOtp,
  };
}
