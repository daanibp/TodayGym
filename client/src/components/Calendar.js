import React, { useState, useContext } from "react";
import Calendar from "react-calendar";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../estilos/Calendar.css";
import { AuthContext } from "../context/AuthContext";

function CustomCalendar({ daysWithSession }) {
    const currentDate = new Date();
    const [date, setDate] = useState(new Date());
    const { user } = useContext(AuthContext);

    const registerDate = new Date(user?.register_date);

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            // Obtener el año, mes y día en formato local
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Añadir ceros al mes si es necesario
            const day = date.getDate().toString().padStart(2, "0"); // Añadir ceros al día si es necesario

            // Formatear la fecha como YYYY-MM-DD
            const dayString = `${year}-${month}-${day}`;

            // Si el día está en daysWithSession, asignamos la clase 'highlight-red'
            if (daysWithSession && daysWithSession.includes(dayString)) {
                return "highlight-red"; // Devolver la clase para aplicar color rojo
            }
        }
        return null;
    };

    // Crear un array de meses desde el mes de la fecha de registro hasta el mes actual
    const months = [];
    let monthDate = new Date(registerDate); // Iniciar con la fecha de registro

    // Asegurarse de agregar solo el primer día de cada mes
    while (monthDate <= currentDate) {
        months.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)); // Asegurarse de que solo el primer día del mes se añada
        monthDate.setMonth(monthDate.getMonth() + 1); // Avanzar al siguiente mes
    }

    // Función para obtener el nombre del mes y el año con la primera letra en mayúscula
    const getMonthYear = (index) => {
        // Obtener la fecha del mes desde el array months
        const monthDate = months[index]; // Acceder al mes desde el array de meses

        const options = { month: "long", year: "numeric" };
        const monthYear = monthDate.toLocaleString("default", options);

        // Capitalizar la primera letra del mes
        return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    };

    // Determinar el índice del mes actual
    const currentMonthIndex = currentDate.getMonth();

    //setDate(new Date(currentDate.getFullYear(), currentMonthIndex, 1));

    // Función para actualizar la fecha según el slide
    const handleSlideChange = (swiper) => {
        const currentSlideMonth = swiper.activeIndex;
        const newDate = months[currentSlideMonth]; // Usar el mes actual basado en el índice del swiper
        setDate(new Date(newDate)); // Cambiar la fecha en el calendario
    };

    return (
        <div className="calendar-container">
            <div
                className="calendario flex justify-center items-center mx-auto text-white"
                style={{ width: "90vw" }}
            >
                <Swiper
                    spaceBetween={10} // Espacio entre los slides
                    slidesPerView={1} // Mostrar un solo mes a la vez
                    initialSlide={currentMonthIndex} // Iniciar en el mes actual
                    onSlideChange={handleSlideChange} // Llamar a handleSlideChange para sincronizar la fecha
                    className="swiper-calendar"
                    loop={false} // Desactivar el loop (no permitir avanzar al siguiente mes)
                    navigation={false} // Desactivar la navegación
                >
                    {months.map((month, index) => (
                        <SwiperSlide key={index}>
                            <div className="month-slide">
                                {/* Título del mes y año */}
                                <div className="month-title justify-center text-center items-center text-lg mb-2">
                                    <h2>{getMonthYear(index)}</h2>
                                </div>

                                {/* Usar el calendario con el mes actual */}
                                <Calendar
                                    //onChange={handleDateChange}
                                    value={date}
                                    tileClassName={tileClassName}
                                    minDate={registerDate}
                                    maxDate={currentDate} // Limitar la navegación solo hacia atrás
                                    view="month" // Mostrar vista de mes
                                    showNeighboringMonth={false} // Evitar mostrar meses vecinos
                                    className={
                                        "text-center justify-center items-center"
                                    }
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}

export default CustomCalendar;
