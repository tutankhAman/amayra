import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
    <Link
      to="/login"
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-3xl text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
    >
      Sign in
    </Link>
  );
};

export default SignUp;