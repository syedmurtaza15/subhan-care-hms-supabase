import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Alert, Button, Spinner } from '../../components/ui';
import { OtpInput } from '../../components/auth';
import { ROUTES } from '../../constants/routes';
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from '../../constants/ui';
import { verifyOtp, requestPasswordReset } from '../../services/authService';
import { validateOtp } from '../../utils/validators';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import './OtpVerificationPage.css';

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackEmail = location.state?.email || storage.get(STORAGE_KEYS.AUTH_USER)?.email || '';
  const [email] = useState(fallbackEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    timerRef.current = setInterval(() => {
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resendIn]);

  const handleSubmit = async (event) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const validationError = validateOtp(code, OTP_LENGTH);
    if (validationError) {
      setError(validationError);
      setCode('');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const response = await verifyOtp({ email, code });
      storage.set(STORAGE_KEYS.AUTH_USER, { ...storage.get(STORAGE_KEYS.AUTH_USER), email, resetToken: response.resetToken });
      navigate(ROUTES.RESET_PASSWORD, {
        state: { email, resetToken: response.resetToken },
      });
    } catch (err) {
      setError(err?.message || 'Invalid code. Please try again.');
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      // Reuse the request endpoint (semantically it's the same call surface)
      await requestPasswordReset({ email });
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError('Failed to resend the code. Try again later.');
    } finally {
      setResending(false);
    }
  }, [email, resendIn, resending]);

  return (
    <div className="otp-page animate-fade-in-up">
      <Link to={ROUTES.FORGOT_PASSWORD} className="otp-page__back">
        <ArrowLeft size={16} aria-hidden="true" /> Change email
      </Link>

      <div className="otp-page__header">
        <span className="otp-page__icon" aria-hidden="true">
          <ShieldCheck size={26} />
        </span>
        <h1 className="otp-page__title">Verify your email</h1>
        <p className="otp-page__subtitle">
          We sent a {OTP_LENGTH}-digit verification code to{' '}
          <strong>{email || 'your email address'}</strong>. Enter it below to continue.
        </p>
      </div>

      <form className="otp-page__form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert type="error" title="Verification issue">
            {error}
          </Alert>
        )}

        <OtpInput length={OTP_LENGTH} value={code} onChange={setCode} error={Boolean(error)} />

        <Button
          type="submit"
          variant="primary"
          size="large"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          fullWidth
          disabled={code.length !== OTP_LENGTH}
        >
          Verify and continue
        </Button>

        <div className="otp-page__resend">
          <p className="otp-page__hint">
            <Mail size={14} aria-hidden="true" />
            <span>Didn&apos;t receive the email? Check your spam folder.</span>
          </p>
          <button
            type="button"
            className="otp-page__resend-btn"
            onClick={handleResend}
            disabled={resendIn > 0 || resending}
            aria-live="polite"
          >
            {resending ? (
              <>
                <Spinner size="small" /> Resending…
              </>
            ) : resendIn > 0 ? (
              <>
                <RefreshCcw size={14} aria-hidden="true" /> Resend in {resendIn}s
              </>
            ) : (
              <>
                <RefreshCcw size={14} aria-hidden="true" /> Resend code
              </>
            )}
          </button>
        </div>
      </form>

      <p className="otp-page__support">
        Wrong email address?{' '}
        <Link to={ROUTES.FORGOT_PASSWORD}>Use a different email</Link>.
      </p>
    </div>
  );
};

export default OtpVerificationPage;
