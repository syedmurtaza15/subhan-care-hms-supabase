import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input, Alert } from '../../components/ui';
import { ROUTES, ROLE_LANDING } from '../../constants/routes';
import { INPUT_TYPES } from '../../constants/ui';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { validateEmail, validateRequired } from '../../utils/validators';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [remember, setRemember] = useState(true);

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);

  const validateAll = (vals) => ({
    email: validateRequired(vals.email, 'Email') || validateEmail(vals.email),
    password: validateRequired(vals.password, 'Password'),
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
    setLastSuccess(null);
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched({ email: true, password: true });
    if (Object.values(allErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const response = await loginUser({ email: values.email, password: values.password });
      login(response.user, response.token, remember);
      setLastSuccess(`Welcome back, ${response.user.name.split(' ')[0]}!`);
      const target = ROLE_LANDING[response.user.role] || response.redirectTo || ROUTES.DASHBOARD;
      setTimeout(() => navigate(target, { replace: true }), 250);
    } catch (error) {
      setServerError(error?.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__intro">
        <h1 className="login-page__title">Welcome back</h1>
        <p className="login-page__subtitle">
          Secure hospital management system — manage patients, appointments, 
          prescriptions, and billing all in one place.
        </p>
      </div>

      <form className="login-page__form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert type="error" title="Sign-in failed">
            {serverError}
          </Alert>
        )}
        {lastSuccess && !serverError && (
          <Alert type="success" title={lastSuccess}>
            Redirecting you to your dashboard…
          </Alert>
        )}

        <Input
          label="Email address"
          type={INPUT_TYPES.EMAIL}
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@subancare.com"
          leftIcon={Mail}
          autoComplete="email"
          required
          error={touched.email ? errors.email : ''}
          helperText="Enter the email address you registered with."
        />

        <Input
          label="Password"
          type={INPUT_TYPES.PASSWORD}
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your password"
          leftIcon={Lock}
          autoComplete="current-password"
          required
          error={touched.password ? errors.password : ''}
        />

        <div className="login-page__row">
          <label className="login-page__checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember me on this device</span>
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="login-page__forgot">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          fullWidth
        >
          Sign in
        </Button>
      </form>

      <p className="login-page__signup">
        New to Subhan Care? <Link to={ROUTES.SIGNUP}>Create an account</Link>
      </p>
    </div>
  );
};

export default LoginPage;