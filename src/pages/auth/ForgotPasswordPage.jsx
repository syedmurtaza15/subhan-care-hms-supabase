import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Alert, Button, Input } from '../../components/ui';
import { INPUT_TYPES } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { requestPasswordReset } from '../../services/authService';
import { validateEmail, validateRequired } from '../../utils/validators';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice(null);

    const requiredError = validateRequired(email, 'Email');
    const emailError = validateEmail(email);
    const message = requiredError || emailError;
    if (message) {
      setError(message);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset({ email: email.trim() });
      storage.set(STORAGE_KEYS.AUTH_USER, { email });
      setNotice({
        type: 'success',
        title: 'Check your inbox',
        message: response.message,
        devHint: response.devCode ? `Demo code: ${response.devCode}` : '',
      });
      // Auto-advance to OTP after a brief celebratory pause
      setTimeout(() => {
        navigate(ROUTES.OTP_VERIFICATION, {
          state: { email: email.trim() },
        });
      }, 1400);
    } catch (err) {
      setError(err?.message || 'Unable to send the reset code. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-page animate-fade-in-up">
      <Link to={ROUTES.LOGIN} className="forgot-page__back">
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </Link>

      <div className="forgot-page__header">
        <span className="forgot-page__icon" aria-hidden="true">
          <KeyRound size={22} />
        </span>
        <div>
          <h1 className="forgot-page__title">Forgot your password?</h1>
          <p className="forgot-page__subtitle">
            Enter the email linked to your Subhan Care account. We&apos;ll send a 6-digit
            verification code you can use to set a new password.
          </p>
        </div>
      </div>

      <form className="forgot-page__form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert type="error" title="Couldn&apos;t send code">
            {error}
          </Alert>
        )}
        {notice && (
          <Alert type={notice.type} title={notice.title}>
            <span>{notice.message}</span>
            {notice.devHint && (
              <p className="forgot-page__dev-hint">{notice.devHint}</p>
            )}
          </Alert>
        )}

        <Input
          label="Email address"
          name="email"
          type={INPUT_TYPES.EMAIL}
          leftIcon={Mail}
          placeholder="you@subancare.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError('');
          }}
          error={error}
          helperText="Use the email address you use to sign in to Subhan Care."
        />

        <Button
          type="submit"
          variant="primary"
          size="large"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          fullWidth
        >
          Send verification code
        </Button>
      </form>

      <div className="forgot-page__support">
        <p>
          Still stuck? Reach out to <a href="#it-support">IT support</a> or call the
          Subhan Care helpdesk at <strong>+92 300 000 0000</strong>.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
