import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { validateSignupForm, checkPasswordCriteria } from '../utils/validation';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const criteria = checkPasswordCriteria(formData.password);

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

    const { isValid, errors: valErrors } = validateSignupForm(formData);
    if (!isValid) {
      setErrors(valErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await signup(formData.name, formData.email, formData.password);

      if (result?.requiresEmailConfirmation) {
        setSuccessInfo(
          'Account created successfully! Please check your email inbox to confirm your account, then log in.'
        );
      } else {
        // Automatically signed in
        navigate('/plan', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-elevated">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Create an Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Join BudgetTrip to start planning smart, financially realistic journeys
        </p>
      </div>

      {successInfo && (
        <div 
          role="status" 
          className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900 mb-1">Registration Complete!</p>
            <p>{successInfo}</p>
            <div className="mt-3">
              <Link
                to="/login"
                className="inline-block px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition"
              >
                Go to Login →
              </Link>
            </div>
          </div>
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
            {serverError.includes('already exists') && (
              <div className="mt-1.5">
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Log in to your account →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label 
            htmlFor="name" 
            className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Alex Johnson"
              aria-invalid={Boolean(errors.name)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                errors.name 
                  ? 'border-red-400 bg-red-50/10 focus:border-red-500' 
                  : 'border-slate-200 focus:border-secondary'
              }`}
            />
          </div>
          {errors.name && (
            <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Address */}
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
              placeholder="alex@example.com"
              aria-invalid={Boolean(errors.email)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                errors.email 
                  ? 'border-red-400 bg-red-50/10 focus:border-red-500' 
                  : 'border-slate-200 focus:border-secondary'
              }`}
            />
          </div>
          {errors.email && (
            <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Minimum 8 characters"
              aria-invalid={Boolean(errors.password)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                errors.password 
                  ? 'border-red-400 bg-red-50/10 focus:border-red-500' 
                  : 'border-slate-200 focus:border-secondary'
              }`}
            />
          </div>
          {errors.password && (
            <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {errors.password}
            </p>
          )}

          {/* Real-time Password Requirements Checklist */}
          <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <span className="font-semibold text-slate-600 block mb-1">
              Password Requirements:
            </span>
            <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {criteria.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-slate-400">•</span>}
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${criteria.hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {criteria.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-slate-400">•</span>}
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${criteria.hasLowercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {criteria.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-slate-400">•</span>}
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {criteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-slate-400">•</span>}
              <span>At least one number (0-9)</span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Re-enter your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                errors.confirmPassword 
                  ? 'border-red-400 bg-red-50/10 focus:border-red-500' 
                  : 'border-slate-200 focus:border-secondary'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {errors.confirmPassword}
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
