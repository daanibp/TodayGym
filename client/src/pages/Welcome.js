import React from "react";
import { Link } from "react-router-dom";
import backgroundImage from "../images/BG2.jpg";

function Welcome() {
    return (
        <div
            className="relative h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="relative h-full text-center text-white bg-black bg-opacity-60">
                <h1
                    className="absolute w-full text-6xl font-bold"
                    style={{
                        fontFamily: "Akronim, cursive",
                        top: "33%",
                        color: "#890000",
                    }}
                >
                    El cambio es <span className="block text-6xl">HOY</span>
                </h1>

                <div
                    className="absolute w-full text-center"
                    style={{ top: "80%" }}
                >
                    <Link
                        to="/login"
                        className="px-8 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-300"
                    >
                        Iniciar Sesión
                    </Link>

                    <p className="mt-4">
                        ¿Eres nuevo?{" "}
                        <Link to="/login?tab=register" className="underline">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
