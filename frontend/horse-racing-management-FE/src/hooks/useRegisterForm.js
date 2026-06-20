import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import { sendVerificationOtp, verifyEmail } from '../api/emailVerifyApi';

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

export function useRegisterForm() {
  const navigate = useNavigate();

  // step: 1 | 2 | 3 | 'success'
  const [step, setStep]               = useState(1);
  const [selectedRole, setSelectedRole] = useState(null); // { id, apiRole, roleLabel }

  const [form, setForm]         = useState(Object.fromEntries(FIELDS.map((f) => [f.name, ''])));
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');

  const [otp, setOtp]                       = useState('');
  const [otpError, setOtpError]             = useState('');
  const [otpLoading, setOtpLoading]         = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [resendLoading, setResendLoading]   = useState(false);
  const [resendSuccess, setResendSuccess]   = useState(false);

  const handleSelectRole = (roleId, apiRole, roleLabel) => {
    setSelectedRole({ id: roleId, apiRole, roleLabel });
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedRole(null);
    } else if (step === 3) {
      setStep(2);
      setOtp('');
      setOtpError('');
      setResendSuccess(false);
    }
  };

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
      setOtp('');
      setOtpError('');
      setResendSuccess(false);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, form) }));
  };

  // Validates all fields, sends OTP, then advances to step 3
  const handleNextStep = async () => {
    const newErrors = {};
    FIELDS.forEach((f) => {
      const err = validate(f.name, form[f.name], form);
      if (err) newErrors[f.name] = err;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSendOtpLoading(true);
    try {
      await sendVerificationOtp(form.email);
      setOtp('');
      setOtpError('');
      setResendSuccess(false);
      setStep(3);
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

  // Verifies OTP → registers → shows success screen
  const handleVerify = async () => {
    if (otp.replace(/\s/g, '').length < 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    setOtpLoading(true);

    // Step 1: verify OTP
    try {
      await verifyEmail(form.email, otp);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
      setOtpLoading(false);
      return;
    }

    // Step 2: register (OTP was valid)
    try {
      const { confirmPassword, ...rest } = form;
      await register({ ...rest, role: selectedRole.apiRole });
      setStep('success');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoToLogin = () => navigate('/login');

  return {
    step, selectedRole,
    form, errors, apiError, handleChange, handleBlur,
    sendOtpLoading, handleNextStep, handleSelectRole, handleBack,
    otp, otpError, otpLoading, resendLoading, resendSuccess,
    handleOtpChange, handleVerify, handleResendOtp,
    handleGoToLogin,
  };
}
