import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col h-screen justify-between bg-neutral-900 overflow-y-hidden">
            <Header />
            <div className="flex-grow overflow-auto">{children}</div>
            <Footer />
        </div>
    );
};

export default MainLayout;
