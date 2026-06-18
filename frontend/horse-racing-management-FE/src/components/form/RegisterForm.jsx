import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FIELDS, useRegisterForm } from '../../hooks/useRegisterForm';
import OtpBoxes from './OtpBoxes';

/* ---- Icons ---- */
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CheckLgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="52" height="52">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* Minimal step dots — 3 pill-shaped dots */
function StepDots({ step }) {
  const numericStep = typeof step === 'number' ? step : 4;
  return (
    <div className="rg-step-dots">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            `rg-step-dot${n === numericStep ? ' rg-step-dot--active' : n < numericStep ? ' rg-step-dot--done' : ''}`
          }
        />
      ))}
    </div>
  );
}

/* ---- Main Export ---- */
export default function RegisterForm({ roles, roleConfig }) {
  const {
    step, selectedRole,
    form, errors, apiError, handleChange, handleBlur,
    sendOtpLoading, handleNextStep, handleSelectRole, handleBack,
    otp, otpError, otpLoading, resendLoading, resendSuccess,
    handleOtpChange, handleVerify, handleResendOtp,
    handleGoToLogin,
  } = useRegisterForm();

  const onRoleClick = (roleId) => {
    const cfg = roleConfig[roleId];
    handleSelectRole(roleId, cfg.apiRole, cfg.roleLabel);
  };

  const [displayedStep, setDisplayedStep] = useState(step);
  const [animClass, setAnimClass] = useState('rg-step-content--enter-fwd');

  useEffect(() => {
    if (step === displayedStep) return;
    const forward = step === 'success' ||
      (typeof step === 'number' && typeof displayedStep === 'number' && step > displayedStep);
    setAnimClass(forward ? 'rg-step-content--exit-fwd' : 'rg-step-content--exit-back');
    const t = setTimeout(() => {
      setDisplayedStep(step);
      setAnimClass(forward ? 'rg-step-content--enter-fwd' : 'rg-step-content--enter-back');
    }, 220);
    return () => clearTimeout(t);
  }, [step]);

  const prefix = selectedRole?.id || 'reg';

  /* ---- Success Screen ---- */
  if (displayedStep === 'success') {
    return (
      <div className="rg-wizard">
        <div className={`rg-success ${animClass}`}>
          <div className="rg-success__icon">
            <CheckLgIcon />
          </div>
          <h2 className="rg-success__title">Registration Successful</h2>
          <p className="rg-success__sub">Your account has been created.</p>
          <button className="rg-form__submit" onClick={handleGoToLogin}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rg-wizard">

      {/* ---- Step 1: Role Selection ---- */}
      {displayedStep === 1 && (
        <div key="step-1" className={`rg-step-content ${animClass}`}>
  
          {/* Brand intro — preserved from original left panel */}
          <div className="rg-wizard__hero">
            <h1 className="rg-wizard__hero-title">
              Your journey<br />starts <span>here.</span>
            </h1>
          </div>

          <div className="rg-step-header rg-step-header--center">
            <p className="rg-step-header__label">Step 1 of 3</p>
            <p className="rg-step-header__sub">YOU WANT TO REGISTER AS A:</p>
          </div>

          <StepDots step={step} />

          <div className="rg-roles">
            {roles.map(({ id, label, desc, Icon }) => (
              <button key={id} className="rg-role-card" onClick={() => onRoleClick(id)}>
                <span className="rg-role-card__icon-wrap">
                  <Icon />
                </span>
                <span className="rg-role-card__body">
                  <span className="rg-role-card__label">{label}</span>
                  <span className="rg-role-card__desc">{desc}</span>
                </span>
              </button>
            ))}
          </div>

          <p className="rg-login">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      )}

      {/* ---- Step 2: Fill in Details ---- */}
      {displayedStep === 2 && (
        <div key="step-2" className={`rg-step-content ${animClass}`}>
  
          <div className="rg-step-header rg-step-header--center">
            <p className="rg-step-header__label">Step 2 of 3</p>
            {selectedRole && <span className="rg-badge">{selectedRole.roleLabel}</span>}
            <h2 className="rg-step-header__title">Create Account</h2>
            <p className="rg-step-header__sub">FILL IN YOUR DETAILS BELOW</p>
          </div>

          <StepDots step={step} />

          <div className="rg-form-wrap">
            <button className="rg-back" onClick={handleBack}>
              <ArrowLeftIcon /> Back
            </button>

            {apiError && <p className="rg-form__api-error">{apiError}</p>}

            <form
              className="rg-form"
              onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}
              noValidate
            >
              <div className="rg-form__grid">
                {FIELDS.map((f) => (
                  <div key={f.name} className={`rg-form__group${f.full ? ' rg-form__group--full' : ''}`}>
                    <label className="rg-form__label" htmlFor={`${prefix}-${f.name}`}>{f.label}</label>
                    <input
                      id={`${prefix}-${f.name}`}
                      name={f.name}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`rg-form__input${errors[f.name] ? ' rg-form__input--error' : ''}`}
                    />
                    {errors[f.name] && <span className="rg-form__error">{errors[f.name]}</span>}
                  </div>
                ))}
              </div>

              <div className="rg-form__actions">
                <button type="submit" className="rg-form__submit" disabled={sendOtpLoading}>
                  {sendOtpLoading ? 'Sending code…' : 'Next Step'}
                </button>
              </div>
            </form>

            <p className="rg-login">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      )}

      {/* ---- Step 3: Verify OTP ---- */}
      {displayedStep === 3 && (
        <div key="step-3" className={`rg-step-content ${animClass}`}>
  
          <div className="rg-step-header rg-step-header--center">
            <p className="rg-step-header__label">Step 3 of 3</p>
            <h2 className="rg-step-header__title">Verify Email</h2>
            <p className="rg-step-header__sub">ENTER THE CODE SENT TO YOUR EMAIL</p>
          </div>

          <StepDots step={step} />

          <div className="rg-otp-step">
            <button className="rg-back rg-back--center" onClick={handleBack}>
              <ArrowLeftIcon /> Back
            </button>

            {apiError && <p className="rg-form__api-error">{apiError}</p>}

            <p className="rg-otp-step__hint">
              We sent a verification code to{' '}
              <strong>{form.email}</strong>
            </p>

            <OtpBoxes value={otp} onChange={handleOtpChange} hasError={!!otpError} />
            {otpError && <span className="rg-form__error rg-otp-step__error">{otpError}</span>}

            <div className="rg-otp-step__resend">
              <span>Didn't receive the code?</span>
              {resendSuccess && <span className="rg-otp-step__resend-ok"> Sent!</span>}
              <button
                type="button"
                className="rg-otp-step__resend-btn"
                onClick={handleResendOtp}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending…' : 'Resend'}
              </button>
            </div>

            <div className="rg-form__actions">
              <button
                type="button"
                className="rg-form__submit"
                onClick={handleVerify}
                disabled={otpLoading}
              >
                {otpLoading ? 'Verifying…' : 'Verify'}
              </button>
            </div>
          </div>

          <p className="rg-login">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      )}

    </div>
  );
}
