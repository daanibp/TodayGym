import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Importamos useLocation
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const location = useLocation(); // Usamos useLocation para obtener la ruta actual

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight); // Actualiza la altura cuando la ventana cambia de tamaño
        };

        // Agregar un listener para cambios de tamaño de ventana
        window.addEventListener("resize", handleResize);

        // Limpiar el listener cuando el componente se desmonte
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Verificar si la ruta actual es "/verify-email"
    const isVerificationPage = location.pathname === "/verify-email";

    return (
        <div
            className="flex flex-col bg-neutral-900"
            style={{
                height: windowHeight, // Establece la altura dinámica según la ventana
                overflow: "hidden", // Evita el scroll global
            }}
        >
            {/* Si no es la página de verificación, renderiza el Header */}
            {!isVerificationPage && <Header />}

            <div
                className="flex-grow overflow-auto"
                style={{
                    paddingTop: "64px",
                    paddingBottom: "64px",
                    height: `calc(${windowHeight}px - 128px)`, // Ajusta el tamaño según el Header y Footer
                }}
            >
                {children}
            </div>

            {/* Si no es la página de verificación, renderiza el Footer */}
            {!isVerificationPage && <Footer />}
        </div>
    );
};

export default MainLayout;
