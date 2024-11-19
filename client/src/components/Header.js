import React from "react";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <div className="header flex items-center justify-between px-4 py-4 w-full z-50">
            <div className="perfil w-16 justify-center">
                <button
                    className="w-16"
                    style={{
                        color: "#890000",
                        fontWeight: "bold",
                    }}
                    onClick={handleProfileClick}
                >
                    <CgProfile className="logo scale-x-150 scale-y-150" />
                </button>
            </div>
            <div className="flex-grow flex justify-center">
                <h1
                    className="text-3xl"
                    style={{
                        fontFamily: "Akronim, cursive",
                        color: "#890000",
                        fontWeight: "bold",
                    }}
                >
                    El cambio es HOY
                </h1>
            </div>
            <div className="w-16" />
        </div>
    );
};

export default Header;
