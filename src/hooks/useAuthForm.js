import { useCallback, useMemo, useState } from 'react';

/**
 * useAuthForm - small controlled-form helper used by auth pages.
 * Tracks values, errors, submitting state, and provides field-level
 * validate-on-blur behavior. Pure React, no external deps.
 *
 * @param {Object} options
 * @param {Object} options.initialValues
 * @param {(values:Object)=>Object<string,string>} options.validate
 * @param {(values:Object)=>Promise<void>} options.onSubmit
 */
const useAuthForm = ({ initialValues = {}, validate, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const runValidation = useCallback(
    (nextValues) => {
      if (!validate) return {};
      const result = validate(nextValues);
      return result && typeof result === 'object' ? result : {};
    },
    [validate],
  );

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const nextValue = type === 'checkbox' ? checked : value;
      setValues((prev) => {
        const nextValues = { ...prev, [name]: nextValue };
        if (touched[name]) {
          const nextErrors = runValidation(nextValues);
          setErrors(nextErrors);
        }
        return nextValues;
      });
    },
    [runValidation, touched],
  );

  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const nextErrors = runValidation(values);
      setErrors(nextErrors);
    },
    [runValidation, values],
  );

  const handleSubmit = useCallback(
    async (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      setServerError('');
      const nextErrors = runValidation(values);
      setErrors(nextErrors);
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      if (Object.values(nextErrors).some(Boolean)) return;

      setIsSubmitting(true);
      try {
        if (onSubmit) await onSubmit(values);
      } catch (error) {
        const message =
          error && error.message
            ? error.message
            : 'Something went wrong. Please try again.';
        setServerError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, runValidation, values],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setServerError('');
    setIsSubmitting(false);
  }, [initialValues]);

  const visibleErrors = useMemo(() => {
    const out = {};
    Object.entries(errors).forEach(([key, value]) => {
      if (touched[key] && value) out[key] = value;
    });
    return out;
  }, [errors, touched]);

  return {
    values,
    errors: visibleErrors,
    allErrors: errors,
    serverError,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
    setTouched,
    setServerError,
  };
};

export default useAuthForm;
