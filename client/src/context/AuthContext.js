import React, { createContext, useState, useEffect } from "react";

// Crear el AuthContext
const AuthContext = createContext();

// AuthProvider que envolverá la aplicación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Estado para almacenar el usuario
    const [token, setToken] = useState(null); // Estado para almacenar el token
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        // Al montar el componente, obtenemos el token almacenado
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Función para manejar el login y guardar el usuario
    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Función para manejar el logout
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
