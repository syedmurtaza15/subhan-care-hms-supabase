import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button, Input, Select, Alert } from '../../components/ui';
import { ROLES, ROLE_LABEL } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';
import { INPUT_TYPES } from '../../constants/ui';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signUpUser } from '../../services/authService';
import { validateEmail, validateRequired, validatePassword, validateConfirmPassword } from '../../utils/validators';
import './LoginPage.css';

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABEL[role] }));

const SignUpPage = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    role: ROLES.DOCTOR,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const validateAll = (vals) => ({
    name: validateRequired(vals.name, 'Full name'),
    email: validateRequired(vals.email, 'Email') || validateEmail(vals.email),
    password: validateRequired(vals.password, 'Password') || validatePassword(vals.password, { strong: true }),
    confirmPassword: validateConfirmPassword(vals.confirmPassword, vals.password),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateAll(next));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateAll(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setSuccess(null);
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.values(allErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const result = await signUpUser({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        name: values.name.trim(),
        role: values.role,
      });

      if (result?.session) {
        // Email confirmation is disabled on this project - the user is
        // already signed in, so send them straight to login to establish
        // a normal session there (keeps the login flow as the single
        // source of truth for redirect-by-role).
        setSuccess('Account created! You can sign in now.');
      } else {
        setSuccess('Account created! Check your email to confirm your address, then sign in.');
      }
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 1800);
    } catch (error) {
      setServerError(error?.message || 'Could not create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__intro">
        <h1 className="login-page__title">Create your account</h1>
        <p className="login-page__subtitle">
          Register for Subhan Care access. Your role determines which parts of the
          dashboard you'll see once you're signed in.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <Alert type="warning" title="Backend not connected">
          Sign-up requires a Supabase project to be configured (see SUPABASE_SETUP.md).
          Ask your administrator for a demo account in the meantime.
        </Alert>
      )}

      <form className="login-page__form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert type="error" title="Sign-up failed">
            {serverError}
          </Alert>
        )}
        {success && (
          <Alert type="success" title={success}>
            Redirecting you to sign in…
          </Alert>
        )}

        <Input
          label="Full name"
          type={INPUT_TYPES.TEXT}
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ayesha Khan"
          leftIcon={User}
          autoComplete="name"
          required
          error={touched.name ? errors.name : ''}
        />

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
        />

        <Select
          label="Role"
          name="role"
          value={values.role}
          onChange={handleChange}
          options={ROLE_OPTIONS}
          helperText="Determines which dashboard sections you'll have access to."
        />

        <Input
          label="Password"
          type={INPUT_TYPES.PASSWORD}
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="At least 8 characters"
          leftIcon={Lock}
          autoComplete="new-password"
          required
          error={touched.password ? errors.password : ''}
        />

        <Input
          label="Confirm password"
          type={INPUT_TYPES.PASSWORD}
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Re-enter your password"
          leftIcon={Lock}
          autoComplete="new-password"
          required
          error={touched.confirmPassword ? errors.confirmPassword : ''}
        />

        <Button
          type="submit"
          variant="primary"
          size="large"
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          fullWidth
          disabled={!isSupabaseConfigured}
        >
          Create account
        </Button>
      </form>

      <p className="login-page__signup">
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </p>
    </div>
  );
};

export default SignUpPage;
