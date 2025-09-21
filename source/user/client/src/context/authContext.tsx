import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinDate: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(
        JSON.parse(localStorage.getItem("user") || "null")
    );

    const isAuthenticated = !!user;

    const login = (user: User, token: string) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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