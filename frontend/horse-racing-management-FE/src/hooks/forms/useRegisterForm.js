import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../../api/authApi';
import { sendVerificationOtp, verifyEmail } from '../../api/emailVerifyApi';

export const FIELDS = [
  { name: 'fullName',        label: 'Full Name',        type: 'text',     placeholder: 'John Doe',         full: true },
  { name: 'username',        label: 'Username',         type: 'text',     placeholder: 'johndoe' },
  { name: 'email',           label: 'Email',            type: 'email',    placeholder: 'john@example.com' },
  { name: 'phone',           label: 'Phone',            type: 'tel',      placeholder: '+84 234 567 890' },
  { name: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••' },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
];

export const validationRules = {
  fullName:        { required: 'Full Name is required' },
  username:        { required: 'Username is required' },
  email:           { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } },
  phone:           { required: 'Phone is required', pattern: { value: /^[0-9]{10,11}$/, message: 'Phone must be 10–11 digits' } },
  password:        { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } },
  confirmPassword: (getValues) => ({
    required: 'Confirm Password is required',
    validate: (v) => v === getValues('password') || 'Passwords do not match',
  }),
};

export function useRegisterForm() {
  const navigate = useNavigate();

  // step: 1 | 2 | 3 | 'success'
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  const [apiError, setApiError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    register,
    getValues,
    setError,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: { fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

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

  // Validates all fields via RHF, sends OTP, advances to step 3
  const handleNextStep = async () => {
    const valid = await trigger();
    if (!valid) return;

    setSendOtpLoading(true);
    try {
      await sendVerificationOtp(getValues('email'));
      setOtp('');
      setOtpError('');
      setResendSuccess(false);
      setStep(3);
    } catch (err) {
      setError('email', { message: err.response?.data?.message || 'Failed to send verification code' });
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
      await sendVerificationOtp(getValues('email'));
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

    try {
      await verifyEmail(getValues('email'), otp);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
      setOtpLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...rest } = getValues();
      await registerApi({ ...rest, role: selectedRole.apiRole });
      setStep('success');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoToLogin = () => navigate('/login');

  return {
    step,
    selectedRole,
    register,
    getValues,
    errors,
    apiError,
    sendOtpLoading,
    handleNextStep,
    handleSelectRole,
    handleBack,
    otp,
    otpError,
    otpLoading,
    resendLoading,
    resendSuccess,
    handleOtpChange,
    handleVerify,
    handleResendOtp,
    handleGoToLogin,
  };
}
