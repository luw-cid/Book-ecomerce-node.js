import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getUser, setUser as saveUser, removeUser, removeTokens, setTokens } from "../utils/tokenStorage";

export interface User {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    joinDate: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, token: string, refreshToken: string, useLocalStorage?: boolean) => void;
    logout: () => void;
    updateUser?: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Load user từ storage khi mount
    const [user, setUser] = useState<User | null>(getUser());

    // Sync user từ storage khi storage thay đổi (từ tab khác)
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = getUser();
            setUser(storedUser);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const isAuthenticated = !!user;

    const login = (user: User, token: string, refreshToken: string, useLocalStorage: boolean = true) => {
        setUser(user);
        saveUser(user);
        setTokens(token, refreshToken, useLocalStorage);
    }

    const logout = () => {
        setUser(null);
        removeUser();
        removeTokens();
    }

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        saveUser(updatedUser);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthProvider, useAuth };