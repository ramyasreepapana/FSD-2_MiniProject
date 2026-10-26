import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import { useAuth } from '../context/useAuth';

const Signup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/plan', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="py-12 sm:py-16 px-4">
      <SignupForm />
    </div>
  );
};

export default Signup;
