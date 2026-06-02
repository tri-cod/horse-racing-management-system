import { Fragment } from 'react';
import { FIELDS, useRegisterForm } from './useRegisterForm';
import OtpBoxes from './OtpBoxes';

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function SpectatorForm({ onBack }) {
  const {
    form, errors, loading, apiError, handleChange, handleBlur, handleSubmit,
    emailVerified, showVerifyCard, sendOtpLoading,
    otp, otpError, otpLoading, resendLoading, resendSuccess,
    handleVerifyClick, handleOtpChange, handleConfirmVerify, handleResendOtp,
  } = useRegisterForm('USER');

  return (
    <main className="rg-right">
      <div className="rg-right__inner">
        <button className="rg-back" onClick={onBack}>
          <ArrowLeftIcon /> Back
        </button>

        <div className="rg-step-header">
          <p className="rg-step-header__label">Step 2 of 2</p>
          <span className="rg-badge">Spectator</span>
          <h1 className="rg-step-header__title">Create Account</h1>
          <p className="rg-step-header__sub">FILL IN YOUR DETAILS BELOW</p>
        </div>

        {apiError && <p className="rg-form__api-error">{apiError}</p>}

        <form className="rg-form" onSubmit={handleSubmit} noValidate>
          <div className="rg-form__grid">
            {FIELDS.map((f) => (
              <Fragment key={f.name}>
                <div className={`rg-form__group${f.full ? ' rg-form__group--full' : ''}`}>
                  <label className="rg-form__label" htmlFor={`spectator-${f.name}`}>{f.label}</label>

                  {f.name === 'email' ? (
                    <div className="rg-form__input-wrap">
                      <input
                        id={`spectator-${f.name}`}
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.name]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`rg-form__input${errors[f.name] ? ' rg-form__input--error' : ''}`}
                      />
                      {emailVerified ? (
                        <span className="rg-form__verified-badge">
                          <CheckIcon /> Verified
                        </span>
                      ) : form.email ? (
                        <button
                          type="button"
                          className="rg-form__verify-btn"
                          onClick={handleVerifyClick}
                          disabled={sendOtpLoading}
                        >
                          {sendOtpLoading ? '…' : 'Verify'}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <input
                      id={`spectator-${f.name}`}
                      name={f.name}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`rg-form__input${errors[f.name] ? ' rg-form__input--error' : ''}`}
                    />
                  )}

                  {errors[f.name] && <span className="rg-form__error">{errors[f.name]}</span>}
                </div>

                {f.name === 'email' && showVerifyCard && (
                  <div className="rg-verify-card rg-form__group--full">
                    <p className="rg-verify-card__msg">
                      We will send a verification code to this email
                    </p>
                    <OtpBoxes value={otp} onChange={handleOtpChange} hasError={!!otpError} />
                    {otpError && <span className="rg-form__error rg-verify-card__otp-error">{otpError}</span>}
                    <div className="rg-verify-card__resend">
                      <span>Didn't receive the code?</span>
                      {resendSuccess && <span className="rg-verify-card__resend-ok"> Sent!</span>}
                      <button
                        type="button"
                        className="rg-verify-card__resend-btn"
                        onClick={handleResendOtp}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Sending…' : 'Resend'}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="rg-verify-card__confirm"
                      onClick={handleConfirmVerify}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Verifying…' : 'Confirm'}
                    </button>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <button type="submit" className="rg-form__submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="rg-login">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </main>
  );
}
