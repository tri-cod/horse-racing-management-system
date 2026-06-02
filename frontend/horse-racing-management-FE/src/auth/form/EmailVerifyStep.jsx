import { useRef } from 'react';

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

function OtpBoxes({ value, onChange, hasError }) {
  const refs = useRef([]);
  const chars = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const focus = (i) => refs.current[i]?.focus();

  const handleChange = (e, i) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = chars.map((c, j) => (j === i ? digit : c));
    onChange(next.join(''));
    if (digit && i < 5) focus(i + 1);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[i]) {
        const next = chars.map((c, j) => (j === i ? '' : c));
        onChange(next.join(''));
      } else if (i > 0) {
        const next = chars.map((c, j) => (j === i - 1 ? '' : c));
        onChange(next.join(''));
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === 'ArrowRight' && i < 5) {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => digits[i] || '');
    onChange(next.join(''));
    focus(Math.min(digits.length, 5));
  };

  return (
    <div className="rg-otp">
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          value={char}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`rg-otp__input${hasError ? ' rg-otp__input--error' : ''}`}
        />
      ))}
    </div>
  );
}

export default function EmailVerifyStep({
  email,
  otp,
  otpError,
  otpLoading,
  resendLoading,
  resendSuccess,
  handleOtpChange,
  handleVerify,
  handleResendOtp,
}) {
  return (
    <main className="rg-right">
      <div className="rg-right__inner">
        <div className="rg-step-header">
          <p className="rg-step-header__label">Step 3 of 3</p>
          <h1 className="rg-step-header__title">Verify Email</h1>
          <p className="rg-step-header__sub">ENTER THE CODE SENT TO YOUR INBOX</p>
        </div>

        <div className="rg-verify">
          <div className="rg-verify__icon">
            <MailIcon />
          </div>
          <p className="rg-verify__email">{email}</p>
          <p className="rg-verify__hint">
            We sent a 6-digit verification code to the email address above.
            Enter it below to confirm your account.
          </p>
        </div>

        <form className="rg-form" onSubmit={handleVerify} noValidate>
          <div className="rg-form__group rg-form__group--full">
            <label className="rg-form__label">Verification Code</label>
            <OtpBoxes value={otp} onChange={handleOtpChange} hasError={!!otpError} />
            {otpError && <span className="rg-form__error">{otpError}</span>}
          </div>

          <button type="submit" className="rg-form__submit" disabled={otpLoading}>
            {otpLoading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div className="rg-verify__resend">
          <span>Didn't receive the code?</span>
          {resendSuccess && <span className="rg-verify__resend-ok"> Sent!</span>}
          <button
            type="button"
            className="rg-verify__resend-btn"
            onClick={handleResendOtp}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </div>
    </main>
  );
}
