import React, { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Expresión regular para validar el formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!emailRegex.test(email)) {
            setError("Por favor, ingresa un correo electrónico válido.");
            return;
        }

        try {
            const response = await fetch(
                "https://regymserver.onrender.com/users/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage(
                    "Se ha enviado un enlace de restablecimiento de contraseña a tu correo."
                );
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError(
                "Hubo un error en la solicitud. Por favor, intenta más tarde."
            );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-11/12 max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-4">
                    ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-center mb-6 text-gray-600">
                    Ingresa tu dirección de correo electrónico y te enviaremos
                    un enlace para restablecer tu contraseña.
                </p>
                {message && (
                    <div className="mb-4 text-center text-green-600">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 text-center text-red-600">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="text-left space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm mb-2">
                            E-mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ingresa tu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-300"
                    >
                        Enviar enlace de restablecimiento
                    </button>
                </form>
                <p className="text-center mt-4">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 underline"
                    >
                        Regresar a Iniciar Sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
