// Ejemplo de un componente ResetPassword
import React, { useState } from "react";
import { useLocation } from "react-router-dom";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Obtiene el token de la URL
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8080/users/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token, password }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Contraseña restablecida correctamente.");
                setError("");
            } else {
                setError(data.error);
                setMessage("");
            }
        } catch (error) {
            setError("Error en la solicitud.");
            setMessage("");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-red-600">
                    Restablecer Contraseña
                </h2>

                {message && (
                    <p className="text-green-500 text-center mb-4">{message}</p>
                )}
                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Nueva Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Confirmar Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                    >
                        Restablecer Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
