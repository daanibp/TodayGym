import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

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

    return (
        <div
            className="flex flex-col bg-neutral-900"
            style={{
                height: windowHeight, // Establece la altura dinámica según la ventana
                overflow: "hidden", // Evita el scroll global
            }}
        >
            <Header />
            <div
                className="flex-grow overflow-auto"
                style={{
                    paddingTop: "64px",
                    paddingBottom: "64px",
                    height: `calc(${windowHeight}px - 128px)`,
                }}
            >
                {children}
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
