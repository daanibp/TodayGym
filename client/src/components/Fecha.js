import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SelectorFecha from "./SelectorFecha";
import { FaChevronDown } from "react-icons/fa";
import { SessionContext } from "../context/SessionContext";
import { IoMdArrowRoundBack } from "react-icons/io";

function Fecha({ currentView, isEditable, setIsEditable }) {
    const today = new Date();
    const navigate = useNavigate();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const {
        selectedDate,
        sessionIdPesas,
        updateSelectedDate,
        updateSessionIdPesas,
    } = useContext(SessionContext);

    const openSelector = () => {
        setIsSelectorOpen(!isSelectorOpen);
    };

    const closeSelector = () => {
        setIsSelectorOpen(false);
    };

    const changeDate = (date) => {
        updateSelectedDate(date);
    };

    const prevDay = () => {
        updateSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() - 1);
            return newDate;
        });
    };

    const nextDay = () => {
        updateSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + 1);
            return newDate;
        });
    };

    const formattedDate = () => {
        const isSameDay = (date1, date2) => {
            return (
                date1.getDate() === date2.getDate() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getFullYear() === date2.getFullYear()
            );
        };

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (isSameDay(selectedDate, today)) {
            return "Hoy";
        } else if (isSameDay(selectedDate, yesterday)) {
            return "Ayer";
        } else if (isSameDay(selectedDate, tomorrow)) {
            return "Mañana";
        } else {
            return `${selectedDate.getDate()} ${selectedDate.toLocaleString(
                "default",
                { month: "short" }
            )} ${selectedDate.getFullYear()}`;
        }
    };

    const toggleEdit = () => {
        setIsEditable(!isEditable);
    };

    const goBack = () => {
        navigate("/diary", {
            state: { currentView: "initial" },
        });
    };

    return (
        <div className="">
            <div
                className="topFecha flex items-center justify-between px-4 py-2 w-full"
                style={{ backgroundColor: "#890000" }}
            >
                {currentView !== "initial" && (
                    <div className="w-2/6 text-left text-lg text-white">
                        <button
                            className="w-full flex"
                            onClick={() => goBack()}
                        >
                            <IoMdArrowRoundBack className="w-full" />
                        </button>
                    </div>
                )}

                <div
                    className="fecha w-full flex items-center justify-center"
                    style={{
                        color: "#ffffff",
                        fontWeight: "bold",
                    }}
                >
                    <div className="inline-flex items-center">
                        <button className="prevDay mx-2" onClick={prevDay}>
                            {"<"}
                        </button>
                        {formattedDate()}
                        <button onClick={openSelector}>
                            <FaChevronDown className="mx-2" />
                        </button>
                        <button className="nextDay" onClick={nextDay}>
                            {">"}
                        </button>
                    </div>
                </div>

                {currentView !== "initial" && (
                    <div className="Editar w-2/6 justify-center">
                        <button
                            className="btnEditar w-16"
                            style={{
                                color: "#ffffff",
                                fontWeight: "bold",
                            }}
                            onClick={toggleEdit}
                        >
                            Editar
                        </button>
                    </div>
                )}
            </div>
            {isSelectorOpen && (
                <SelectorFecha onClose={closeSelector} onAccept={changeDate} />
            )}
        </div>
    );
}

export default Fecha;
