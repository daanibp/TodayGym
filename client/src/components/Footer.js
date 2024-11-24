import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="w-full fixed bottom-0 left-0 right-0 z-40">
            {/* Curva decorativa */}
            <div className="absolute bottom-[-60px] left-[-30%] right-[-30%] h-[140px] bg-[#890000] rounded-t-full z-1"></div>

            {/* Barra de navegación */}
            <div className="relative bg-[#890000] h-[60px] flex justify-around items-center text-white font-bold z-10">
                {/* Enlaces del footer */}
                <Link
                    to="/dashboard"
                    className="flex-1 text-center text-white md:text-lg lg:text-xl flex justify-center items-center"
                >
                    Panel
                </Link>
                <Link
                    to="/diary"
                    state={{ currentView: "initial" }}
                    className="flex-1 text-center text-white md:text-lg lg:text-xl flex justify-center items-center"
                >
                    Diario
                </Link>
                <Link
                    to="/progress"
                    className="flex-1 text-center text-white md:text-lg lg:text-xl flex justify-center items-center"
                >
                    Progreso
                </Link>
            </div>
        </div>
    );
};

export default Footer;
