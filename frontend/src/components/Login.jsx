// Import React hooks and context utilities
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

//Login and Register component (originally a page but technically a page but supposed to be a pop up component in dashboard)
//takes in simple email/password forms that invoke authContext methods to login or register and on success then redirects to dashboard 

// Login component handles user login and guest login
export default function Login({ onSuccess, onCancel, onSwitch }) {
  // Get login and guestLogin functions from AuthContext
  const { login, guestLogin } = useContext(AuthContext);
  // State for form fields and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // React Router navigation hook
  const nav = useNavigate();

  // Handle form submission for user login
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await login(email.trim().toLowerCase(), password); // Attempt login
      if (onSuccess) onSuccess(); // If modal, close on success
      else nav('/dashboard'); // Otherwise, navigate to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed'); // Show error
    }
  };

  // Render login form and guest login button
  return (
    <div className="w-full flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-black text-center mb-2">Log In</h2>
          {/* Error message */}
          {error && (
            <div className="text-red-600 text-sm text-center py-1">{error}</div>
          )}
          {/* Email input */}
          <input
            type="email"
            name="email"
            value={email}
            autoComplete="username"
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full p-2 rounded border bg-blue-50 dark:bg-gray-900"
          />
          {/* Password input */}
          <input
            type="password"
            name="password"
            value={password}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full p-2 rounded border bg-blue-50 dark:bg-gray-900"
          />
          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded py-2 mt-2 hover:bg-blue-700 transition font-medium"
          >
            Login
          </button>
          {/* Cancel and Register links/buttons */}
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
              Don't have an account?{' '}
              {onSwitch ? (
                <button
                  type="button"
                  className="text-green-600 underline"
                  onClick={onSwitch}
                >
                  Register
                </button>
              ) : (
                <Link to="/register" className="text-green-600 underline">
                  Register
                </Link>
              )}
            </span>
          </div>
        </form>
        {/* Guest login button */}
        <button
          // This button is for guest login
          // It will log in the user as a guest and redirect to the dashboard
          className="mt-6 w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          type="button"
          onClick={async () => {
            //debugging because Issue with guest login not working properly
            console.log('Guest continue pressed!');
            await guestLogin();
            // Forcing reload to ensure AuthContext and routing update correctly
            // This is a workaround for the issue with React Router not updating the URL
            // immediately after login
            window.location.href = '/dashboard';
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
