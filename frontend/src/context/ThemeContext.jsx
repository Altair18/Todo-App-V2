// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()
// This component provides the ThemeContext to its children. Sharing the theme state across the app.

export function ThemeProvider({ children }) { // ThemeProvider component wraps that stores current theme (dark or light) in local storage and provides it to the app.
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored !== null ? JSON.parse(stored) : false;
  }); //used for dark / light mode

  // toggles the <html> class so Tailwind’s dark: variants work
  useEffect(() => {
    const root = window.document.documentElement
    if (dark)  root.classList.add('dark')
    else       root.classList.remove('dark');
    localStorage.setItem('darkMode', JSON.stringify(dark));
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  )
}
