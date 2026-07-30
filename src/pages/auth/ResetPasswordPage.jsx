import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Check, ArrowRight, LockKeyhole } from 'lucide-react';
import { Alert, Button, Input } from '../../components/ui';
import { INPUT_TYPES } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { resetPassword } from '../../services/authService';
import {
  validatePassword,
  validateConfirmPassword,
  isEmpty,
} from '../../utils/validators';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import './ResetPasswordPage.css';

const STRENGTH_LEVELS = [
  { label: 'Too weak', threshold: 0 },
  { label: 'Weak', threshold: 1 },
  { label: 'Fair', threshold: 2 },
  { label: 'Strong', threshold: 3 },
];

const computeStrength = (pwd) => {
  if (!pwd) return { level: 0, score: 0 };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^\w\s]/.test(pwd)) score += 1;
  return { level: Math.min(score, 4), score };
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;
  const persistedEmail = location.state?.email || storage.get(STORAGE_KEYS.AUTH_USER)?.email || '';

  const [values, setValues] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const strength = computeStrength(values.password);

  const validateAll = (vals) => ({
    password: validatePassword(vals.password, { strong: true }),
    confirm: isEmpty(vals.confirm)
      ? 'Please confirm your password'
      : validateConfirmPassword(vals.confirm, vals.password),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) {
      setErrors(validateAll(next));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const nextTouched = { ...touched, [name]: true };
    setTouched(nextTouched);
    setErrors(validateAll(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched({ password: true, confirm: true });
    if (Object.values(allErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const targetToken = resetToken || storage.get(STORAGE_KEYS.AUTH_USER)?.resetToken;
      await resetPassword({ resetToken: targetToken, password: values.password });
      storage.remove(STORAGE_KEYS.AUTH_USER);
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 900);
    } catch (err) {
      setServerError(err?.message || 'Could not reset password. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-page animate-fade-in-up">
      <Link to={ROUTES.OTP_VERIFICATION} className="reset-page__back">
        <ArrowLeft size={16} aria-hidden="true" /> Back to verification
      </Link>

      <div className="reset-page__header">
        <span className="reset-page__icon" aria-hidden="true">
          <LockKeyhole size={26} />
        </span>
        <h1 className="reset-page__title">Set a new password</h1>
        <p className="reset-page__subtitle">
          {persistedEmail ? (
            <>
              Choose a fresh password for{' '}
              <strong>{persistedEmail}</strong> to regain access to your Subhan Care workspace.
            </>
          ) : (
            <>
              Choose a fresh password to regain access to your Subhan Care workspace.
            </>
          )}
        </p>
      </div>

      <form className="reset-page__form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert type="error" title="Couldn&apos;t update password">
            {serverError}
          </Alert>
        )}

        <Input
          label="New password"
          name="password"
          type={INPUT_TYPES.PASSWORD}
          leftIcon={Lock}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
        />

        {values.password && (
          <div className="reset-page__strength" aria-live="polite">
            <div className="reset-page__strength-bar" aria-hidden="true">
              <span
                className={`reset-page__strength-fill reset-page__strength-fill--${strength.level}`}
                style={{ width: `${(strength.level / 4) * 100}%` }}
              />
            </div>
            <p>
              Strength:{' '}
              <strong>{STRENGTH_LEVELS[Math.min(strength.level, STRENGTH_LEVELS.length - 1)].label}</strong>
            </p>
          </div>
        )}

        <Input
          label="Confirm new password"
          name="confirm"
          type={INPUT_TYPES.PASSWORD}
          leftIcon={Lock}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          required
          value={values.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirm ? errors.confirm : ''}
        />

        <ul className="reset-page__rules">
          <li className={values.password.length >= 8 ? 'is-met' : ''}>
            <Check size={14} aria-hidden="true" /> At least 8 characters long
          </li>
          <li className={/[A-Z]/.test(values.password) ? 'is-met' : ''}>
            <Check size={14} aria-hidden="true" /> One uppercase letter (A-Z)
          </li>
          <li className={/[a-z]/.test(values.password) ? 'is-met' : ''}>
            <Check size={14} aria-hidden="true" /> One lowercase letter (a-z)
          </li>
          <li className={/\d/.test(values.password) ? 'is-met' : ''}>
            <Check size={14} aria-hidden="true" /> One number (0-9)
          </li>
          <li className={/[^\w\s]/.test(values.password) ? 'is-met' : ''}>
            <Check size={14} aria-hidden="true" /> One special character
          </li>
        </ul>

        <Button
          type="submit"
          variant="primary"
          size="large"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          fullWidth
        >
          Update password
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
