import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { validateLoginForm } from '../utils/validation';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target if redirected from a protected route
  const from = location.state?.from?.pathname || '/plan';
  const redirectedMessage = location.state?.message;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { isValid, errors: valErrors } = validateLoginForm(formData);
    if (!isValid) {
      setErrors(valErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-elevated">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Log in to manage your trip plans and saved itineraries
        </p>
      </div>

      {redirectedMessage && (
        <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2">
          <span>ℹ️</span>
          <span>{redirectedMessage}</span>
        </div>
      )}

      {serverError && (
        <div 
          role="alert" 
          className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-shake"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{serverError}</span>
            {serverError.includes('sign up') && (
              <div className="mt-1.5">
                <Link to="/signup" className="text-primary font-bold hover:underline">
                  Create an account now →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                errors.email 
                  ? 'border-red-400 bg-red-50/10 focus:border-red-500' 
                  : 'border-slate-200 focus:border-secondary'
              }`}
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                errors.password 
                  ? 'border-red-400 bg-red-50/10 focus:border-red-500' 
                  : 'border-slate-200 focus:border-secondary'
              }`}
            />
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-primary hover:bg-primary-light active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-secondary mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-bold hover:underline">
          Sign up for free
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
