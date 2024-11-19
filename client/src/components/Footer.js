import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="w-full fixed bottom-0 left-0 right-0 z-40">
            <div
                style={{
                    position: "absolute",
                    bottom: "-60px",
                    left: "-30%",
                    right: "-30%",
                    height: "140px", // Altura que simula la curva
                    backgroundColor: "#890000",
                    borderRadius: "50% 50% 0 0",
                    zIndex: 1,
                }}
            ></div>
            <div
                style={{
                    position: "relative",
                    backgroundColor: "#890000",
                    zIndex: 1,
                    height: "60px",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    color: "white",
                    fontWeight: "bold",
                }}
            >
                <Link
                    to="/dashboard"
                    className="text-white text-center md:text-lg lg:text-xl"
                >
                    Panel
                </Link>
                <Link
                    to={{
                        pathname: "/diary",
                    }}
                    state={{ currentView: "initial" }}
                    className="text-white text-center md:text-lg lg:text-xl"
                >
                    Diario
                </Link>
                <Link
                    to="/progress"
                    className="text-white text-center md:text-lg lg:text-xl"
                >
                    Progreso
                </Link>
            </div>
        </div>
    );
};

export default Footer;
