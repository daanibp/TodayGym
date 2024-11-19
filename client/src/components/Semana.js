import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

const Semana = () => {
    const [diasConSesion, setDiasConSesion] = useState([]);
    // Obtener la fecha actual
    const hoy = new Date();

    // Obtener el día de la semana actual (0 = domingo, 1 = lunes, ..., 6 = sábado)
    const diaDeLaSemana = hoy.getDay();

    // Calcular el lunes de la semana actual
    const lunes = new Date(hoy);
    lunes.setDate(
        hoy.getDate() - (diaDeLaSemana === 0 ? 6 : diaDeLaSemana - 1)
    ); // Si es domingo, restamos 6, si es lunes restamos 0.

    // Generar los días de la semana actual
    const diasDeLaSemana = Array.from({ length: 7 }, (_, i) => {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        return {
            fechaCompleta: dia,
            texto: `${dia.getDate()} ${
                ["lu", "ma", "mi", "ju", "vi", "sa", "do"][i]
            }`,
            esHoy: i === diaDeLaSemana - 1,
        };
    });

    useEffect(() => {
        // Función para obtener los días con sesiones desde la API
        const fetchDiasConSesion = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8080/sessions/week"
                );
                const data = await response.json();

                // Asumiendo que data es un array de fechas en formato 'YYYY-MM-DD'
                setDiasConSesion(
                    data.map(
                        (sesion) => new Date(sesion).toISOString().split("T")[0]
                    )
                );
            } catch (error) {
                console.error("Error fetching session days:", error);
            }
        };

        fetchDiasConSesion();
    }, []);

    return (
        <div className="semana-container">
            <div
                className="semana-grid py-2 px-4 text-white"
                style={{ backgroundColor: "#890000" }}
            >
                {/* Título */}
                <div className="semana-header mb-1 md:text-lg lg:text-xl">
                    TU SEMANA
                </div>

                {/* Línea horizontal */}
                <div
                    style={{
                        height: "2px",
                        backgroundColor: "white",
                        margin: "0 auto",
                        width: "100%",
                    }}
                />

                {/* Días de la semana */}
                <div className="semana-dias grid grid-cols-7 gap-2 mt-2">
                    {diasDeLaSemana.map((dia, index) => (
                        <div
                            key={index}
                            className={`dia border-2 h-20 flex flex-col ${
                                dia.esHoy
                                    ? " border-yellow-500"
                                    : "border-white"
                            }`}
                        >
                            {/* Parte superior con el día */}
                            <div
                                className="flex items-center justify-center text-center text-xs md:text-lg lg:text-2xl"
                                style={{ height: "40%" }}
                            >
                                {dia.texto}
                            </div>
                            {/* Línea horizontal */}
                            <div
                                style={{
                                    height: "2px",
                                    backgroundColor: "white",
                                    width: "100%",
                                }}
                            />
                            {/* Parte inferior */}
                            <div
                                className="flex-grow flex items-center justify-center"
                                style={{ height: "60%" }}
                            >
                                {diasConSesion.includes(
                                    dia.fechaCompleta
                                        .toISOString()
                                        .split("T")[0]
                                ) && <FaStar />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Semana;
