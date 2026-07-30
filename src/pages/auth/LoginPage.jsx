import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Input, Alert } from '../../components/ui';
import RoleSelector from '../../components/auth/RoleSelector';
import { ROLES, DEMO_CREDENTIALS, maskPassword } from '../../constants/roles';
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
  const [role, setRole] = useState(ROLES.ADMIN);
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

  const fillDemo = (selectedRole) => {
    setRole(selectedRole);
    const seed = DEMO_CREDENTIALS[selectedRole];
    const next = { email: seed.email, password: seed.password };
    setValues(next);
    setErrors({});
    setTouched({ email: true, password: true });
    setServerError('');
    setLastSuccess(null);
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
          {isSupabaseConfigured
            ? 'Sign in to access your Subhan Care workspace with a registered account, or pick a demo role below to auto-fill.'
            : 'Sign in to access your Subhan Care workspace. Use any valid email and a password of at least 6 characters, or pick a demo role below to auto-fill.'}
        </p>
      </div>

      <RoleSelector activeRole={role} onSelect={fillDemo} />

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
          helperText={
            isSupabaseConfigured
              ? 'Use a registered account, or a demo account from the pills above.'
              : 'Local demo mode: any email format works, your role is inferred automatically.'
          }
        />

        <Input
          label="Password"
          type={INPUT_TYPES.PASSWORD}
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your password (min 6 characters)"
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

        <div className="login-page__hint">
          <Sparkles size={14} aria-hidden="true" />
          <span>
            {isSupabaseConfigured
              ? 'Tip: click any role pill above to auto-fill a working demo account.'
              : 'Tip: click any role pill above to auto-fill demo credentials, or just type your own email and password.'}
          </span>
        </div>
      </form>

      <div className="login-page__demo-card">
        <div className="login-page__demo-card-header">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Available demo accounts</span>
        </div>
        <ul className="login-page__demo-list">
          {Object.values(ROLES).map((r) => (
            <li key={r}>
              <span className="login-page__demo-role">{DEMO_CREDENTIALS[r].email}</span>
              <span className="login-page__demo-pass">{maskPassword(DEMO_CREDENTIALS[r].password)}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="login-page__signup">
        New to Subhan Care? <Link to={ROUTES.SIGNUP}>Create an account</Link>
      </p>
    </div>
  );
};

export default LoginPage;