import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('driver_guard_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Simulate login - in a real app, this would hit an API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simple mock validation
                if (email && password) {
                    // Check if user exists in "DB" (localStorage) but for now just mock login
                    const storedDB = localStorage.getItem('driver_guard_db_users');
                    let users = storedDB ? JSON.parse(storedDB) : [];

                    const foundUser = users.find(u => u.email === email && u.password === password);

                    if (foundUser) {
                        const sessionUser = { email: foundUser.email, name: foundUser.name };
                        setUser(sessionUser);
                        localStorage.setItem('driver_guard_user', JSON.stringify(sessionUser));
                        resolve(sessionUser);
                    } else {
                        reject('Invalid email or password');
                    }
                } else {
                    reject('Email and password are required');
                }
            }, 800);
        });
    };

    const register = (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Save to "DB"
                const storedDB = localStorage.getItem('driver_guard_db_users');
                let users = storedDB ? JSON.parse(storedDB) : [];

                // Check if exists
                if (users.find(u => u.email === userData.email)) {
                    // Actually reject here in real world, but for simplicity let's just overwrite or ignore
                    // For this demo, let's allow it but warn conceptually
                }

                users.push(userData);
                localStorage.setItem('driver_guard_db_users', JSON.stringify(users));

                // Auto login
                const sessionUser = { email: userData.email, name: userData.name };
                setUser(sessionUser);
                localStorage.setItem('driver_guard_user', JSON.stringify(sessionUser));
                resolve(sessionUser);
            }, 800);
        });
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('driver_guard_user');
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};