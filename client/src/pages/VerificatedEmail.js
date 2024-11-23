import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function VerificatedEmail() {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Obtener parámetros de la URL
    const query = new URLSearchParams(useLocation().search);
    const statusFromUrl = query.get("status"); // success o error
    const messageFromUrl = query.get("message"); // El mensaje específico

    useEffect(() => {
        if (statusFromUrl === "success") {
            setMessage(decodeURIComponent(messageFromUrl));
            setStatus("success");
        } else if (statusFromUrl === "error") {
            setMessage(decodeURIComponent(messageFromUrl));
            setStatus("error");
        }
        setLoading(false);
    }, [statusFromUrl, messageFromUrl]);

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-100"
            style={{ zIndex: "10000" }}
        >
            <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Verificación de Correo Electrónico
                </h2>

                {loading ? (
                    <p className="text-gray-500 text-center mb-4">
                        Verificando...
                    </p>
                ) : status === "success" ? (
                    <p className="text-green-500 text-center mb-4">{message}</p>
                ) : (
                    <p className="text-red-500 text-center mb-4">{message}</p>
                )}

                {/* Botón para regresar a la página principal */}
                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Volver a la página principal
                    </a>
                </div>
            </div>
        </div>
    );
}

export default VerificatedEmail;
