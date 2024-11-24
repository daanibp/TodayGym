import React, { useState, useEffect, useRef } from "react";

function SelectorFecha({ onClose, onAccept }) {
    const today = new Date();
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

    const handleScroll = (type, value) => {
        if (type === "day") setSelectedDay(value);
        if (type === "month") setSelectedMonth(value);
        if (type === "year") setSelectedYear(value);
    };

    const handleAccept = () => {
        // Crear la fecha utilizando métodos UTC
        const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
        onAccept(selectedDate);
        onClose();
    };

    const scrollToSelected = (ref, value, offset = 0) => {
        if (ref.current) {
            const element = ref.current.querySelector(
                `[data-value="${value}"]`
            );
            if (element) {
                element.scrollIntoView({ block: "center" });
            }
        }
    };

    useEffect(() => {
        scrollToSelected(dayRef, selectedDay);
        scrollToSelected(monthRef, selectedMonth);
        scrollToSelected(yearRef, selectedYear);
    }, [selectedDay, selectedMonth, selectedYear]);

    const generateArray = (start, end) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <div>
            <div
                className="selector left-0 right-0 inset-0 p-4 shadow-lg z-50 "
                style={{
                    backgroundColor: "#890000",
                    color: "white",
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onClose} className="font-bold text-lg">
                        X
                    </button>
                    <h2 className="font-bold text-lg">Cambiar Fecha</h2>
                    <button
                        onClick={handleAccept}
                        className="font-bold text-lg"
                    >
                        OK
                    </button>
                </div>

                <div className="flex justify-center space-x-4 text-center border-y-2">
                    {/* Days */}
                    <div className="relative" ref={dayRef}>
                        <div
                            className="scrollable-list"
                            style={{
                                height: "140px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                scrollSnapType: "y mandatory",
                            }}
                        >
                            <ul className="space-y-2">
                                {generateArray(
                                    1,
                                    daysInMonth(selectedMonth, selectedYear)
                                ).map((day) => (
                                    <li
                                        key={day}
                                        data-value={day}
                                        onClick={() => handleScroll("day", day)}
                                        style={{
                                            scrollSnapAlign: "center",
                                            padding: "8px",
                                            cursor: "pointer",
                                            fontWeight:
                                                selectedDay === day
                                                    ? "bold"
                                                    : "normal",
                                            backgroundColor:
                                                selectedDay === day
                                                    ? "#FFD700"
                                                    : "transparent",
                                        }}
                                    >
                                        {day}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Months */}
                    <div className="relative" ref={monthRef}>
                        <div
                            className="scrollable-list"
                            style={{
                                height: "140px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                scrollSnapType: "y mandatory",
                            }}
                        >
                            <ul className="space-y-2">
                                {months.map((month, index) => (
                                    <li
                                        key={index}
                                        data-value={index}
                                        onClick={() =>
                                            handleScroll("month", index)
                                        }
                                        style={{
                                            scrollSnapAlign: "center",
                                            padding: "8px",
                                            cursor: "pointer",
                                            fontWeight:
                                                selectedMonth === index
                                                    ? "bold"
                                                    : "normal",
                                            backgroundColor:
                                                selectedMonth === index
                                                    ? "#FFD700"
                                                    : "transparent",
                                        }}
                                    >
                                        {month}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Years */}
                    <div className="relative" ref={yearRef}>
                        <div
                            className="scrollable-list"
                            style={{
                                height: "140px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                scrollSnapType: "y mandatory",
                            }}
                        >
                            <ul className="space-y-2">
                                {generateArray(
                                    selectedYear - 50,
                                    selectedYear + 50
                                ).map((year) => (
                                    <li
                                        key={year}
                                        data-value={year}
                                        onClick={() =>
                                            handleScroll("year", year)
                                        }
                                        style={{
                                            scrollSnapAlign: "center",
                                            padding: "8px",
                                            cursor: "pointer",
                                            fontWeight:
                                                selectedYear === year
                                                    ? "bold"
                                                    : "normal",
                                            backgroundColor:
                                                selectedYear === year
                                                    ? "#FFD700"
                                                    : "transparent",
                                        }}
                                    >
                                        {year}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SelectorFecha;
