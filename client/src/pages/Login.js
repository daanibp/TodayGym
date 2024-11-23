import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import backgroundImage from "../images/BG2.jpg";
import "../estilos/Login.css";
import { FaSpinner } from "react-icons/fa";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailR, setEmailR] = useState("");
    const [passwordR, setPasswordR] = useState("");
    const [name, setName] = useState("");
    const [surnames, setSurnames] = useState("");
    const [errorR, setErrorR] = useState(null);
    const [successMessageR, setSuccessMessageR] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [acceptTerms, setAcceptTerms] = useState(false);

    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(
        new URLSearchParams(location.search).get("tab") === "register"
            ? "register"
            : "login"
    );

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validar que ambos campos estén llenos
        if (!email || !password) {
            setError("Por favor ingresa correo y contraseña.");
            return;
        }

        // Validar que el email tenga un formato válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,24}$/;

        if (!emailRegex.test(email)) {
            setError("Por favor ingresa un E-mail válido.");
            return;
        }

        // Resetea el error al hacer un nuevo intento de login
        setError(null);

        setLoading(true); // Activar loading

        try {
            // Enviar los datos al servidor
            const response = await fetch(
                "https://regymserver.onrender.com/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();

            setLoading(false);

            if (response.ok) {
                // Aquí recibes tanto el token como los datos del usuario
                const { token, user } = data;
                //localStorage.setItem("accessToken", data.token);
                //onLogin(data.token);

                // Guardar el token y el usuario en el AuthContext
                onLogin(user, token);
                // Redirigir al usuario a la página principal o dashboard
                navigate("/dashboard");
            } else {
                setError(data.error);
            }
        } catch (error) {
            setLoading(false);
            setError("Hubo un problema al intentar iniciar sesión.");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validar que ambos campos estén llenos
        if (!emailR || !passwordR || !name || !surnames) {
            setErrorR("Por favor ingresa todos los campos.");
            return;
        }

        // Validar que el email tenga un formato válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,24}$/;
        if (!emailRegex.test(emailR)) {
            setErrorR("Por favor ingresa un E-mail válido.");
            return;
        }

        // Validar que la contraseña no esté vacía
        if (passwordR.length < 6) {
            setErrorR("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (!acceptTerms) {
            setErrorR("Debes aceptar los términos y condiciones.");
            return;
        }

        // Resetea el error al hacer un nuevo intento de registro
        setErrorR(null);
        setLoading(true);

        // Obtener la fecha actual en formato yyyy-mm-dd
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0]; // Esto da formato yyyy-mm-dd

        try {
            // Enviar los datos al servidor
            const response = await fetch(
                "https://regymserver.onrender.com/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        surnames,
                        email: emailR,
                        password: passwordR,
                        register_date: formattedDate,
                    }),
                }
            );

            const data = await response.json();

            setLoading(false);

            if (response.ok) {
                setSuccessMessageR(data.message);
                setErrorR("");
                // Limpiar los campos
                setName("");
                setSurnames("");
                setEmailR("");
                setPasswordR("");
            } else {
                setErrorR(data.error);
                setSuccessMessageR("");
            }
        } catch (error) {
            setLoading(false);
            setErrorR("Hubo un problema al intentar realizar el registro.");
        }
    };

    return (
        <div
            className="relative h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="flex flex-col items-center justify-center h-full text-center text-white bg-black bg-opacity-60 overflow-auto responsive-container">
                <h1
                    className="text-5xl md:text-8xl lg:text-8xl font-bold mb-4 lg:mb-0 responsive-heading"
                    style={{ fontFamily: "Akronim, cursive", color: "#890000" }}
                >
                    El cambio es{" "}
                    <span className="block text-5xl md:text-8xl lg:text-8xl responsive-heading">
                        HOY
                    </span>
                </h1>

                <div className="bg-black bg-opacity-80 rounded-3xl p-4 md:p-8 my-6 lg:my-2 md:my-2 w-11/12 max-w-lg md:max-w-2xl mx-auto">
                    {/* Tab selector */}
                    <div className="flex justify-center space-x-2 mb-6">
                        <button
                            className={`w-full md:w-auto px-4 py-2 font-bold text-white rounded-tl-lg ${
                                activeTab === "login"
                                    ? "bg-red-600"
                                    : "bg-gray-600"
                            }`}
                            onClick={() => setActiveTab("login")}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            className={`w-full md:w-auto px-4 py-2 font-bold text-white rounded-tr-lg ${
                                activeTab === "register"
                                    ? "bg-red-600"
                                    : "bg-gray-600"
                            }`}
                            onClick={() => setActiveTab("register")}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Formulario de Iniciar Sesión */}
                    {activeTab === "login" && (
                        <form className="text-left space-y-4">
                            <h2 className="text-lg md:text-xl font-semibold text-center mb-4 md:mb-6">
                                Bienvenido al cambio
                            </h2>
                            <div className="mb-4 md:mb-6">
                                <label
                                    htmlFor="email"
                                    className="block text-sm md:text-base"
                                >
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-3 py-2 border-b border-gray-400 bg-transparent text-white outline-none"
                                    placeholder="Ingresa tu email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                    autoComplete="email"
                                />
                            </div>
                            <div className="mb-4 md:mb-6">
                                <label
                                    htmlFor="password"
                                    className="block text-sm md:text-base"
                                >
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full px-3 py-2 border-b border-gray-400 bg-transparent text-white outline-none"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-300"
                                onClick={handleLogin}
                                disabled={loading} // Desactiva el botón mientras se está cargando
                            >
                                {loading ? (
                                    <div className="flex justify-center items-center">
                                        <FaSpinner className="animate-spin text-white text-2xl" />
                                    </div>
                                ) : (
                                    "Iniciar Sesión"
                                )}
                            </button>
                            <p className="text-center mt-4 md:mt-6">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-gray-300 underline"
                                >
                                    ¿Olvidaste la contraseña?
                                </Link>
                            </p>
                        </form>
                    )}

                    {/* Formulario de Registro */}
                    {activeTab === "register" && (
                        <form className="text-left space-y-4">
                            <h2 className="text-lg md:text-xl font-semibold text-center mb-4 md:mb-6">
                                Crea tu cuenta
                            </h2>
                            <div className="mb-4 md:mb-6">
                                <label
                                    htmlFor="nombre"
                                    className="block text-sm md:text-base"
                                >
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    className="w-full px-3 py-2 border-b border-gray-400 bg-transparent text-white outline-none"
                                    placeholder="Ingresa tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="given-name"
                                />
                            </div>
                            <div className="mb-4 md:mb-6">
                                <label
                                    htmlFor="apellidos"
                                    className="block text-sm md:text-base"
                                >
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    id="apellidos"
                                    className="w-full px-3 py-2 border-b border-gray-400 bg-transparent text-white outline-none"
                                    placeholder="Ingresa tus apellidos"
                                    value={surnames}
                                    onChange={(e) =>
                                        setSurnames(e.target.value)
                                    }
                                    autoComplete="family-name"
                                />
                            </div>
                            <div className="mb-4 md:mb-6">
                                <label
                                    htmlFor="email"
                                    className="block text-sm md:text-base"
                                >
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-3 py-2 border-b border-gray-400 bg-transparent text-white outline-none"
                                    placeholder="Ingresa tu email"
                                    value={emailR}
                                    onChange={(e) => setEmailR(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                            <div className="mb-6">
                                <label
                                    htmlFor="password"
                                    className="block text-sm md:text-base"
                                >
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full px-3 py-2 border-b border-gray-400 bg-transparent text-white outline-none"
                                    placeholder="Crea una contraseña"
                                    value={passwordR}
                                    onChange={(e) =>
                                        setPasswordR(e.target.value)
                                    }
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="inline-flex items-start">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        className="mr-2 mt-1"
                                        checked={acceptTerms}
                                        onChange={(e) =>
                                            setAcceptTerms(e.target.checked)
                                        }
                                    />
                                    <span className="text-sm md:text-base text-white">
                                        Acepto los{" "}
                                        <a
                                            href="/politica-de-privacidad"
                                            target="_blank"
                                            className="text-blue-500 underline hover:text-blue-700"
                                        >
                                            términos y condiciones
                                        </a>{" "}
                                        y la política de privacidad.
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-300"
                                onClick={handleRegister}
                                disabled={loading} // Desactiva el botón mientras se está cargando
                            >
                                {loading ? (
                                    <div className="flex justify-center items-center">
                                        <FaSpinner className="animate-spin text-white text-2xl" />
                                    </div>
                                ) : (
                                    "Registrarse"
                                )}
                            </button>
                        </form>
                    )}
                    {error && activeTab === "login" && (
                        <div style={{ color: "red", marginTop: "10px" }}>
                            {error}
                        </div>
                    )}
                    {errorR && activeTab === "register" && (
                        <div style={{ color: "red", marginTop: "10px" }}>
                            {errorR}
                        </div>
                    )}
                    {successMessageR && activeTab === "register" && (
                        <div style={{ color: "green", marginTop: "10px" }}>
                            {successMessageR}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;
