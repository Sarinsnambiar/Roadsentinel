import { createContext, useContext, useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, realtimeDb } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch additional user data from Realtime Database if needed
                try {
                    const userRef = ref(realtimeDb, `users/${currentUser.uid}`);
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        setUser({ ...currentUser, ...userData });
                    } else {
                        setUser(currentUser);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe; // Cleanup subscription on unmount
    }, []);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const register = async (userData) => {
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const newUser = userCredential.user;

            // 2. Update their display name in Auth (optional but good practice)
            await updateProfile(newUser, { displayName: userData.name });

            // 3. Save additional info (like their name) into the Realtime Database
            try {
                const userRef = ref(realtimeDb, `users/${newUser.uid}`);
                await set(userRef, {
                    uid: newUser.uid,
                    email: userData.email,
                    name: userData.name,
                    role: 'driver',
                    createdAt: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Database write permission denied (User auth created though): ", dbError);
                // We don't throw here so the user can still log in if DB rules are strict/locked
            }

            // The onAuthStateChanged listener will automatically pick up the new user and set it in state
            return newUser;
        } catch (error) {
            console.error("Registration error:", error);
            throw error; // Let the UI handle the error message
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const resetPassword = async (email) => {
        return await sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        login,
        register,
        logout,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};