import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Semanas() {
    const { user } = useContext(AuthContext);
    const [week, setWeek] = useState(getCurrentWeek());
    const [sessionDays, setSessionDays] = useState([]);
    const [setsCategory, setSetsCategory] = useState({});

    // Días de la semana en español
    const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];

    // Función para formatear las fechas en YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes entre 01 y 12
        const day = date.getDate().toString().padStart(2, "0"); // Día entre 01 y 31
        return `${year}-${month}-${day}`;
    };

    // Función para obtener la semana actual
    function getCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (domingo) a 6 (sábado)

        // Ajustar para que el lunes sea el inicio de la semana
        const startOfWeek = new Date(today);
        if (dayOfWeek === 0) {
            // Si hoy es domingo, retrocedemos 6 días para llegar al lunes anterior
            startOfWeek.setDate(today.getDate() - 6);
        } else {
            // Retrocede hasta el lunes de esta semana
            startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
        }

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

        return formatWeek(startOfWeek, endOfWeek);
    }

    // Función para cambiar a la semana anterior
    function prevWeek() {
        const startOfWeek = new Date(week.startDate);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        setWeek(formatWeek(startOfWeek, endOfWeek));
    }

    // Función para cambiar a la siguiente semana
    function nextWeek() {
        const startOfWeek = new Date(week.startDate);
        startOfWeek.setDate(startOfWeek.getDate() + 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        setWeek(formatWeek(startOfWeek, endOfWeek));
    }

    // Formatear las fechas como `11-17 Noviembre 2024` y calcular días individuales
    function formatWeek(start, end) {
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

        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }

        // Función para formatear las fechas en YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes entre 01 y 12
            const day = date.getDate().toString().padStart(2, "0"); // Día entre 01 y 31
            return `${year}-${month}-${day}`;
        };

        if (
            start.getMonth() !== end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return {
                startDate: formatDate(start), // Usar el formato YYYY-MM-DD
                display: `${start.getDate()} ${
                    months[start.getMonth()]
                } - ${end.getDate()} ${
                    months[end.getMonth()]
                } ${start.getFullYear()}`,
                days,
            };
        } else if (
            start.getMonth() !== end.getMonth() &&
            start.getFullYear() !== end.getFullYear()
        ) {
            return {
                startDate: formatDate(start), // Usar el formato YYYY-MM-DD
                display: `${start.getDate()} ${
                    months[start.getMonth()]
                } ${start.getFullYear()} - ${end.getDate()} ${
                    months[end.getMonth()]
                } ${end.getFullYear()}`,
                days,
            };
        }
        return {
            startDate: formatDate(start), // Usar el formato YYYY-MM-DD
            display: `${start.getDate()}-${end.getDate()} ${
                months[start.getMonth()]
            } ${start.getFullYear()}`,
            days,
        };
    }

    useEffect(() => {
        const fetchDiasConSesion = async () => {
            try {
                const start = week.startDate; // Ya está en el formato local YYYY-MM-DD
                const end = week.days[6]; // El último día de la semana

                // Formatear el último día en YYYY-MM-DD
                const endDateString = formatDate(end);

                // Llamada a la API con parámetros dinámicos
                const response = await fetch(
                    `https://regymserver.onrender.com/sessions/week?start=${start}&end=${endDateString}&userId=${user.id}`
                );

                const data = await response.json();

                setSessionDays(Array.isArray(data) ? data : []);  // Ensure it's an array
            } catch (error) {
                console.error("Error fetching session days:", error);
            }
        };

        const fetchNumberOfSets = async () => {
            try {
                const start = week.startDate; // Ya está en el formato local YYYY-MM-DD
                const end = week.days[6]; // El último día de la semana

                // Formatear el último día en YYYY-MM-DD
                const endDateString = formatDate(end);

                // Llamada a la API con parámetros dinámicos
                const response = await fetch(
                    `https://regymserver.onrender.com/sessions/week/getNumberOfSetsByCategory?start=${start}&end=${endDateString}&userId=${user.id}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setSetsCategory(data.setsByCategory);
                }
            } catch (error) {
                console.error("Error fetching session days:", error);
            }
        };
        fetchDiasConSesion();
        fetchNumberOfSets();
    }, [week, user.id]);

    return (
        <div className="w-full overflow-y-auto">
            <div
                className="semana-header flex items-center justify-center py-2"
                style={{
                    backgroundColor: "#890000",
                }}
            >
                <button
                    className="prevDay mx-2 text-white text-lg"
                    onClick={prevWeek}
                >
                    {"<"}
                </button>
                <div className="week-display text-white text font-bold">
                    {week.display}
                </div>
                <button
                    className="nextDay mx-2 text-white text-lg"
                    onClick={nextWeek}
                >
                    {">"}
                </button>
            </div>

            <div className="days-container w-full flex justify-between items-center p-2 py-4">
                {week.days.map((day, index) => {
                    const dateString = formatDate(day); // Usar el formato YYYY-MM-DD local
                    const hasSession = sessionDays.includes(dateString); // Verificar si hay sesión

                    return (
                        <div
                            key={index}
                            className="day-item flex flex-col items-center w-12 h-20 rounded-2xl text-white relative"
                            style={{ backgroundColor: "#890000" }}
                        >
                            <span className="day-number text-lg font-bold">
                                {day.getDate()} {/* Mostrar solo el día */}
                            </span>
                            <span className="day-label text-sm">
                                {daysOfWeek[index]}
                            </span>
                            {hasSession && (
                                <span
                                    className="text-yellow-300 text-lg "
                                    title="Sesión realizada"
                                >
                                    ★
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mostrar tabla con sets por categoría */}
            <div
                className="sets-summary mt-4 p-4 bg-neutral-800 text-white rounded-lg mx-auto mb-24"
                style={{ width: "90%" }}
            >
                <h3 className="text-lg font-bold mb-4">Nº Sets esta Semana</h3>
                <table className="min-w-full table-auto border-collapse text-white">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left border border-neutral-700">
                                Categoría
                            </th>
                            <th className="px-4 py-2 text-left border border-neutral-700">
                                Número de Sets
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Iterar sobre las categorías predefinidas */}
                        {[
                            "Pectoral",
                            "Espalda",
                            "Pierna",
                            "Hombro",
                            "Bíceps",
                            "Tríceps",
                            "Abdominales",
                        ].map((category, index) => (
                            <tr key={index} className="border">
                                <td className="px-4 py-2 border border-neutral-700">
                                    {category} {/* Mostrar la categoría */}
                                </td>
                                <td className="px-4 py-2 border border-neutral-700">
                                    {setsCategory[category] || 0}{" "}
                                    {/* Mostrar 0 si no existe el set */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Semanas;
