// Register.jsx

// Registration form component for new users. Handles user input, error display, and calls AuthContext's register method. 
// Supports modal and standalone usage.

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register({ onSuccess, onCancel, onSwitch }) {
  const { register } = useContext(AuthContext);
  // State for form fields and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Call AuthContext register method
      await register(email.trim().toLowerCase(), password);
      if (onSuccess) onSuccess(); // If used in modal, close modal
      else nav('/dashboard');     // Otherwise, navigate to dashboard
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed'
      );
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-2">Register</h2>
          {/* Error message display */}
          {error && (
            <div className="text-red-600 text-sm text-center py-1">{error}</div>
          )}
          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 rounded border bg-blue-50 dark:bg-gray-900"
            required
          />
          {/* Password input */}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 rounded border bg-blue-50 dark:bg-gray-900"
            required
          />
          {/* Register button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white rounded py-2 mt-2 hover:bg-green-600 transition font-medium"
          >
            Register
          </button>
          {/* Cancel and switch to login */}
          <div className="flex justify-between items-center mt-2">
            {onCancel && (
              <button
                type="button"
                className="text-gray-500 text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            <span className="text-sm">
              Already have an account?{' '}
              {onSwitch ? (
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={onSwitch}
                >
                  Log In
                </button>
              ) : (
                <Link to="/login" className="text-blue-600 underline">
                  Log In
                </Link>
              )}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
