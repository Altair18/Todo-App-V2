import { createContext, useState, useEffect } from 'react';
import api from '../api'; // Import the API instance

export const AuthContext = createContext(); // Create the AuthContext
// This component provides the AuthContext to its children

//this , AuthContext provides a react context that holds the state (current user object) or null and a loading flag while the app
// checks if the user is logged in or not. It also provides functions to login, register, logout and guest login.

export function AuthProvider({ children }) { // AuthProvider component wraps the entire app
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login/guest on load for guest or token, sets user and flips loading off.
  useEffect(() => {
    console.log('AuthContext useEffect: token=', localStorage.getItem('token'), 'guest=', localStorage.getItem('guest'));
    // Add a log to see when user changes
    console.log('AuthContext useEffect: user is', user);
    if (localStorage.getItem('guest') === 'true') {
      setUser(null);
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    if (token) {
      setUser({}); // Replace with user data from backend if available
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('AuthContext user state changed:', user);
  }, [user]);

  // Standard login
  const login = async (email, password) => { //Call the api to login, store the token in local storage and set the user state, clear guest mode
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.removeItem('guest');
    setUser(data.user);
  };

  // Standard register 
  const register = async (email, password) => { //same as login but call api to register
    const { data } = await api.post('/auth/register', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.removeItem('guest');
    setUser(data.user);
  };

  // Logout (for both login and guest mode)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guest');
    setUser(null);
  };

  // Guest login (sets guest mode)
  const guestLogin = () => {
    console.log('AuthContext.guestLogin called'); //I used this for debugging
    localStorage.removeItem('token');
    localStorage.setItem('guest', 'true');
    setUser(null);
  };

  return ( //wraps the entire react app so the values and methods are available throughh useContext(AuthContext)
    <AuthContext.Provider value={{ //provides the user object, loading state and methods to the children
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      guestLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}
