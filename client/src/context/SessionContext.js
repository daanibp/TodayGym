import React, { createContext, useState, useEffect } from "react";

// Crear el contexto
const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    // Estado para almacenar la fecha seleccionada y el sessionId
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessionIdPesas, setSessionIdPesas] = useState(null);
    const [sessionIdCardio, setSessionIdCardio] = useState(null);

    useEffect(() => {
        // Recuperar datos de localStorage al montar el componente
        const storedDate = localStorage.getItem("selectedDate");
        const storedSessionIdPesas = localStorage.getItem("sessionIdPesas");
        const storedSessionIdCardio = localStorage.getItem("sessionIdCardio");

        if (storedDate) {
            setSelectedDate(new Date(storedDate));
        }
        if (storedSessionIdPesas) {
            setSessionIdPesas(storedSessionIdPesas);
        }
        if (storedSessionIdCardio) {
            setSessionIdCardio(storedSessionIdCardio);
        }
    }, []);

    useEffect(() => {
        // Almacenar en localStorage cada vez que cambia selectedDate, sessionIdPesas o sessionIdCardio
        if (selectedDate) {
            localStorage.setItem("selectedDate", selectedDate);
        }
        if (sessionIdPesas) {
            localStorage.setItem("sessionIdPesas", sessionIdPesas);
        }
        if (sessionIdCardio) {
            localStorage.setItem("sessionIdCardio", sessionIdCardio);
        }
    }, [selectedDate, sessionIdPesas, sessionIdCardio]);

    // Funciones para actualizar el estado
    const updateSelectedDate = (date) => setSelectedDate(date);
    const updateSessionIdPesas = (id) => setSessionIdPesas(id);
    const updateSessionIdCardio = (id) => setSessionIdCardio(id);

    return (
        <SessionContext.Provider
            value={{
                selectedDate,
                sessionIdPesas,
                sessionIdCardio,
                updateSelectedDate,
                updateSessionIdPesas,
                updateSessionIdCardio,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export { SessionContext };
