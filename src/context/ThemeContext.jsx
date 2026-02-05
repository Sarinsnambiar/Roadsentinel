import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('slate'); // slate | light | neon

    useEffect(() => {
        // Load saved theme
        const savedTheme = localStorage.getItem('driver_guard_theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // Apply theme to body
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('driver_guard_theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};