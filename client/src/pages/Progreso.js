import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import CustomCalendar from "../components/Calendar";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "../estilos/Progreso.css";

function Progreso() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Top
    const [numberOfSessions, setNumberOfSessions] = useState();

    // Ejercicios de Pesas
    const [exercisesFav, setExercisesFav] = useState([]);
    const [maxNumberOfSets, setMaxNumberOfSets] = useState();
    const [allMaxWeightLifted, setAllMaxWeightLifted] = useState([]);

    // Ejercicios de Cardio
    const [exercisesCardioFav, setExercisesCardioFav] = useState([]);
    const [maxNumberOfIntervals, setMaxNumberOfIntervals] = useState();
    const [allMaxDistance, setAllMaxDistance] = useState([]);

    // Calendar
    const [daysWithSession, setDaysWithSession] = useState([]);

    // Registrar los componentes necesarios
    ChartJS.register(
        CategoryScale,
        LinearScale,
        LineElement,
        PointElement,
        Title,
        Tooltip,
        Legend
    );

    useEffect(() => {
        try {
            const getNumberOfSessions = async () => {
                const response = await fetch(
                    `https://regymserver.onrender.com/sessions/getNumberOfSessions/${user.id}`
                );
                const data = await response.json();
                setNumberOfSessions(data.numberOfSessions);
            };

            const getDaysWithSession = async () => {
                const response = await fetch(
                    `https://regymserver.onrender.com/sessions/getDaysWithSession/${user.id}`
                );
                const data = await response.json();
                setDaysWithSession(data.days);
            };

            getNumberOfSessions();
            getDaysWithSession();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [user.id]);

    useEffect(() => {
        let exercisesF = [];
        try {
            const getExercisesFav = async () => {
                const response = await fetch(
                    `https://regymserver.onrender.com/exercises/pesas/getExercisesFav/${user.id}`
                );
                const data = await response.json();
                setExercisesFav(data.exercisesFav);
                exercisesF = data.exercisesFav;
                setMaxNumberOfSets(data.max);
            };

            const getAllMaxWeightLifted = async () => {
                if (!exercisesF || exercisesF.length === 0) return;
                else {
                    const allMaxWeightPromises = exercisesF.map(
                        async (exercise) => {
                            try {
                                const response = await fetch(
                                    `https://regymserver.onrender.com/exercises/getMaxWeightBySession?userId=${user.id}&exercise_name=${exercise.exercise_name}`
                                );
                                const exerciseData = await response.json();

                                if (response.ok) {
                                    return exerciseData.map((session) => ({
                                        exercise_name: exercise.exercise_name,
                                        session_date: session.session_date,
                                        max_weight: session.max_weight,
                                    }));
                                }
                            } catch (error) {
                                console.error("Error in fetch request:", error);
                                return undefined;
                            }
                        }
                    );

                    const allMaxWeight = (
                        await Promise.all(allMaxWeightPromises)
                    )
                        .flat()
                        .filter((item) => item !== undefined);
                    setAllMaxWeightLifted(allMaxWeight);
                }
            };

            getExercisesFav().then(() => {
                getAllMaxWeightLifted();
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [user.id]);

    useEffect(() => {
        let exercisesCardioF = [];
        try {
            const getExercisesCardioFav = async () => {
                const response = await fetch(
                    `https://regymserver.onrender.com/exercises/cardio/getExercisesFav/${user.id}`
                );
                const data = await response.json();
                setExercisesCardioFav(data.exercisesFav);
                exercisesCardioF = data.exercisesFav;
                setMaxNumberOfIntervals(data.max);
            };

            const getAllMaxDistance = async () => {
                if (!exercisesCardioF || exercisesCardioF.length === 0) return;
                else {
                    const allMaxDistancePromises = exercisesCardioF.map(
                        async (exercise) => {
                            try {
                                const response = await fetch(
                                    `https://regymserver.onrender.com/exercises/getMaxAvgSpeedBySession?userId=${user.id}&exercise_name=${exercise.exercise_name}`
                                );
                                const exerciseData = await response.json();

                                if (response.ok) {
                                    return exerciseData.map((session) => ({
                                        exercise_name: exercise.exercise_name,
                                        session_date: session.session_date,
                                        max_avgSpeed: session.max_avgSpeed,
                                    }));
                                }
                            } catch (error) {
                                console.error("Error in fetch request:", error);
                                return undefined;
                            }
                        }
                    );

                    const allMaxDistance = (
                        await Promise.all(allMaxDistancePromises)
                    )
                        .flat()
                        .filter((item) => item !== undefined);
                    setAllMaxDistance(allMaxDistance);
                }
            };

            getExercisesCardioFav().then(() => {
                getAllMaxDistance();
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [user.id]);

    const mostrarEjerciciosFavoritos = (type) => {
        navigate("/favExercises", { state: { type: type } });
    };

    const verHistorial = (type, exercise_name) => {
        navigate("/exerciseHistory", {
            state: { type: type, exercise_name: exercise_name },
        });
    };

    return (
        <div className="progress flex flex-col h-full">
            {/* Contenedor fijo */}
            <div className="top fixed w-full z-50 bg-neutral-900">
                <div
                    className="top flex items-center border-y-2"
                    style={{ borderColor: "#890000" }}
                >
                    <div
                        className="flex w-24 h-24 justify-center items-center border border-2-white bg-white rounded-full ml-8 mt-2 mb-2"
                        style={{ backgroundColor: "#890000" }}
                    >
                        <FaUser className="w-12 h-12 text-white" />
                    </div>
                    <div className="h-20 user ml-8 align-top">
                        <p className="text-white font-bold">
                            Progreso de {user.name}
                        </p>
                        <p className="text-white">
                            Nº Entrenamientos: {numberOfSessions}
                        </p>
                    </div>
                </div>
            </div>

            {/* Parte desplazable */}
            <div className="content overflow-auto h-full pt-[120px] pb-[100px]">
                {/* Ejercicios */}
                <h2 className="text-white text-center text-xl font-bold mt-4 mb-4">
                    Ejercicios de Pesas
                </h2>
                <div
                    className="ejercicios flex justify-center items-center mx-auto responsive-slide-sets-height"
                    style={{
                        "--sets": maxNumberOfSets,
                        width: "90vw",
                    }}
                >
                    {!exercisesFav || exercisesFav.length === 0 ? (
                        <div className="flex justify-center items-center">
                            <button
                                className="p-4 text-white rounded-full text-3xl"
                                style={{ backgroundColor: "#890000" }}
                                onClick={() =>
                                    mostrarEjerciciosFavoritos("Pesas")
                                }
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <Swiper
                            modules={[Pagination, Navigation]}
                            spaceBetween={10}
                            slidesPerView={1}
                            pagination={{ clickable: true }}
                        >
                            {exercisesFav.map((exercise, index) => (
                                <SwiperSlide
                                    key={index}
                                    className="bg-neutral-800 rounded-lg responsive-slide-sets-height"
                                    style={{
                                        //height: `calc((100vh - 200px - 96px + 20px) / 2 + (${maxNumberOfSets} * 20px))`,
                                        "--sets": maxNumberOfSets,
                                        width: "90vw",
                                    }}
                                >
                                    <Swiper
                                        modules={[Pagination]}
                                        spaceBetween={10}
                                        slidesPerView={1}
                                        className="h-full"
                                    >
                                        <SwiperSlide className="h-full">
                                            <div className="p-4 text-white rounded-lg h-full">
                                                <div className="flex mb-2 text-lg">
                                                    <p className="font-bold mr-4">
                                                        {exercise.exercise_name}
                                                    </p>
                                                    <button
                                                        className="border px-3 text-base rounded-3xl"
                                                        onClick={() => {
                                                            verHistorial(
                                                                "Pesas",
                                                                exercise.exercise_name
                                                            );
                                                        }}
                                                    >
                                                        Historial
                                                    </button>
                                                </div>

                                                <div
                                                    className="grafico"
                                                    style={{ height: "80%" }}
                                                >
                                                    {(() => {
                                                        const filteredData =
                                                            allMaxWeightLifted.filter(
                                                                (entry) =>
                                                                    entry.exercise_name ===
                                                                    exercise.exercise_name
                                                            );

                                                        if (
                                                            filteredData.length ===
                                                            0
                                                        ) {
                                                            return (
                                                                <p className="text-gray-300">
                                                                    No hay datos
                                                                    disponibles
                                                                    para este
                                                                    ejercicio.
                                                                </p>
                                                            );
                                                        }

                                                        const chartData = {
                                                            labels: filteredData.map(
                                                                (session) =>
                                                                    session.session_date
                                                            ),
                                                            datasets: [
                                                                {
                                                                    label: "Peso Máximo (kg)",
                                                                    data: filteredData.map(
                                                                        (
                                                                            session
                                                                        ) =>
                                                                            session.max_weight
                                                                    ),
                                                                    borderColor:
                                                                        "rgba(75, 192, 192, 1)",
                                                                    backgroundColor:
                                                                        "rgba(75, 192, 192, 0.2)",
                                                                    tension: 0.4,
                                                                },
                                                            ],
                                                        };

                                                        const options = {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    display: true,
                                                                    position:
                                                                        "top",
                                                                },
                                                                tooltip: {
                                                                    enabled: true,
                                                                },
                                                                labels: {
                                                                    color: "white",
                                                                },
                                                            },
                                                            scales: {
                                                                x: {},
                                                                y: {
                                                                    title: {
                                                                        display: true,
                                                                        text: "Peso Máximo (kg)",
                                                                    },
                                                                },
                                                            },
                                                        };

                                                        return (
                                                            <Line
                                                                data={chartData}
                                                                options={
                                                                    options
                                                                }
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide className="h-full">
                                            <div className="p-4 text-white rounded-lg h-full">
                                                <div className="flex mb-2 text-lg">
                                                    <p className="font-bold mr-4">
                                                        {exercise.exercise_name}
                                                    </p>
                                                    <button
                                                        className="border px-3 text-base rounded-3xl"
                                                        onClick={() => {
                                                            verHistorial(
                                                                "Pesas",
                                                                exercise.exercise_name
                                                            );
                                                        }}
                                                    >
                                                        Historial
                                                    </button>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="table-auto w-full text-sm text-left text-gray-300 border mt-1 mb-5">
                                                        <thead className="font-semibold border-b">
                                                            <tr>
                                                                <th className="px-4 py-2 border-r">
                                                                    Tipo
                                                                </th>
                                                                <th className="px-4 py-2">
                                                                    Valor
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mayor Peso
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {
                                                                        exercise.max_weight
                                                                    }{" "}
                                                                    kg
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mejor
                                                                    Volumen
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {
                                                                        exercise.max_volume
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mejores Sets
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {exercise
                                                                        .best_sets
                                                                        .length >
                                                                    0 ? (
                                                                        <ul>
                                                                            {exercise.best_sets.map(
                                                                                (
                                                                                    set,
                                                                                    setIndex
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            setIndex
                                                                                        }
                                                                                    >
                                                                                        Set{" "}
                                                                                        {setIndex +
                                                                                            1}

                                                                                        :
                                                                                        <span className="mx-2">
                                                                                            {
                                                                                                set.weight
                                                                                            }{" "}
                                                                                            kg
                                                                                            x{" "}
                                                                                            {
                                                                                                set.reps
                                                                                            }
                                                                                        </span>
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    ) : (
                                                                        <span>
                                                                            Sin
                                                                            sets
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    </Swiper>
                                </SwiperSlide>
                            ))}
                            {/* Last page with a button (no exercises) */}
                            <SwiperSlide>
                                <div
                                    className="flex justify-center items-center h-full bg-neutral-800 rounded-lg responsive-slide-sets-height"
                                    style={{
                                        "--sets": maxNumberOfSets,
                                        //height: `calc((100vh - 200px - 96px + 20px) / 2 + (${maxNumberOfSets} * 20px))`,
                                        width: "90vw",
                                    }}
                                >
                                    <button
                                        className="p-4 text-white rounded-full text-3xl"
                                        style={{ backgroundColor: "#890000" }}
                                        onClick={() => {
                                            mostrarEjerciciosFavoritos("Pesas");
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    )}
                </div>

                {/* Ejercicios */}
                <h2 className="text-white text-center text-xl font-bold mt-4 mb-4">
                    Ejercicios de Cardio
                </h2>
                <div
                    className="ejercicios flex justify-center items-center mx-auto responsive-slide-intervals-height"
                    style={{
                        "--intervals": maxNumberOfIntervals,
                        //height: `calc((100vh - 200px - 96px + 20px) / 2 + (${maxNumberOfIntervals} * 20px))`,
                        width: "90vw",
                    }}
                >
                    {!exercisesCardioFav || exercisesCardioFav.length === 0 ? (
                        <div className="flex justify-center items-center">
                            <button
                                className="p-4 text-white rounded-full text-3xl"
                                style={{ backgroundColor: "#890000" }}
                                onClick={() =>
                                    mostrarEjerciciosFavoritos("Cardio")
                                }
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <Swiper
                            modules={[Pagination, Navigation]}
                            spaceBetween={10}
                            slidesPerView={1}
                            pagination={{ clickable: true }}
                        >
                            {exercisesCardioFav.map((exercise, index) => (
                                <SwiperSlide
                                    key={index}
                                    className="bg-neutral-800 rounded-lg responsive-slide-intervals-height"
                                    style={{
                                        "--intervals": maxNumberOfIntervals,
                                        //height: `calc((100vh - 200px - 96px + 20px) / 2 + (${maxNumberOfIntervals} * 20px))`,
                                        width: "90vw",
                                    }}
                                >
                                    <Swiper
                                        modules={[Pagination]}
                                        spaceBetween={10}
                                        slidesPerView={1}
                                        className="h-full"
                                    >
                                        <SwiperSlide className="h-full">
                                            <div className="p-4 text-white rounded-lg h-full">
                                                <div className="flex mb-2 text-lg">
                                                    <p className="font-bold mr-4">
                                                        {exercise.exercise_name}
                                                    </p>
                                                    <button
                                                        className="border px-3 text-base rounded-3xl"
                                                        onClick={() => {
                                                            verHistorial(
                                                                "Cardio",
                                                                exercise.exercise_name
                                                            );
                                                        }}
                                                    >
                                                        Historial
                                                    </button>
                                                </div>
                                                <div
                                                    className="grafico"
                                                    style={{ height: "80%" }}
                                                >
                                                    {(() => {
                                                        const filteredData =
                                                            allMaxDistance.filter(
                                                                (entry) =>
                                                                    entry.exercise_name ===
                                                                    exercise.exercise_name
                                                            );

                                                        if (
                                                            filteredData.length ===
                                                            0
                                                        ) {
                                                            return (
                                                                <p className="text-gray-300">
                                                                    No hay datos
                                                                    disponibles
                                                                    para este
                                                                    ejercicio.
                                                                </p>
                                                            );
                                                        }

                                                        const chartData = {
                                                            labels: filteredData.map(
                                                                (session) =>
                                                                    session.session_date
                                                            ),
                                                            datasets: [
                                                                {
                                                                    label: "Velocidad media Máxima (km/h)",
                                                                    data: filteredData.map(
                                                                        (
                                                                            session
                                                                        ) =>
                                                                            session.max_avgSpeed
                                                                    ),
                                                                    borderColor:
                                                                        "rgba(75, 192, 192, 1)",
                                                                    backgroundColor:
                                                                        "rgba(75, 192, 192, 0.2)",
                                                                    tension: 0.4,
                                                                },
                                                            ],
                                                        };

                                                        const options = {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    display: true,
                                                                    position:
                                                                        "top",
                                                                },
                                                                tooltip: {
                                                                    enabled: true,
                                                                },
                                                                labels: {
                                                                    color: "white",
                                                                },
                                                            },
                                                            scales: {
                                                                x: {},
                                                                y: {
                                                                    title: {
                                                                        display: true,
                                                                        text: "Velocidad media Máxima (km/h)",
                                                                    },
                                                                },
                                                            },
                                                        };

                                                        return (
                                                            <Line
                                                                data={chartData}
                                                                options={
                                                                    options
                                                                }
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide className="h-full">
                                            <div className="p-4 text-white rounded-lg h-full">
                                                <div className="flex mb-2 text-lg">
                                                    <p className="font-bold mr-4">
                                                        {exercise.exercise_name}
                                                    </p>
                                                    <button
                                                        className="border px-3 text-base rounded-3xl"
                                                        onClick={() => {
                                                            verHistorial(
                                                                "Cardio",
                                                                exercise.exercise_name
                                                            );
                                                        }}
                                                    >
                                                        Historial
                                                    </button>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="table-auto w-full text-sm text-left text-gray-300 border mt-1 mb-5">
                                                        <thead className="font-semibold border-b">
                                                            <tr>
                                                                <th className="px-4 py-2 border-r">
                                                                    Tipo
                                                                </th>
                                                                <th className="px-4 py-2">
                                                                    Valor
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mayor
                                                                    Distancia
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {
                                                                        exercise.max_distance
                                                                    }{" "}
                                                                    km
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mayor
                                                                    Duración
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {
                                                                        exercise.max_duration
                                                                    }{" "}
                                                                    min
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mayor
                                                                    Velocidad
                                                                    Media
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {
                                                                        exercise.max_volume
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-2 font-semibold border-r">
                                                                    Mejores
                                                                    Intervalos
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {exercise
                                                                        .best_intervals
                                                                        .length >
                                                                    0 ? (
                                                                        <ul className="">
                                                                            {exercise.best_intervals.map(
                                                                                (
                                                                                    set,
                                                                                    setIndex
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            setIndex
                                                                                        }
                                                                                    >
                                                                                        I{" "}
                                                                                        {setIndex +
                                                                                            1}

                                                                                        :
                                                                                        <span className="mx-2">
                                                                                            {
                                                                                                set.best_volume
                                                                                            }{" "}
                                                                                            km
                                                                                            /
                                                                                            h
                                                                                        </span>
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    ) : (
                                                                        <span>
                                                                            Sin
                                                                            intervalos
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    </Swiper>
                                </SwiperSlide>
                            ))}
                            {/* Last page with a button (no exercises) */}
                            <SwiperSlide>
                                <div
                                    className="flex justify-center items-center h-full bg-neutral-800 rounded-lg responsive-slide-intervals-height"
                                    style={{
                                        "--intervals": maxNumberOfIntervals,
                                        // height: `calc((100vh - 200px - 96px + 20px) / 2 + (${maxNumberOfIntervals} * 20px))`,
                                        width: "90vw",
                                    }}
                                >
                                    <button
                                        className="p-4 text-white rounded-full text-3xl"
                                        style={{ backgroundColor: "#890000" }}
                                        onClick={() => {
                                            mostrarEjerciciosFavoritos(
                                                "Cardio"
                                            );
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    )}
                </div>

                {/* Calendario */}
                <h2 className="text-white text-center text-xl font-bold mt-4 mb-4">
                    Calendario
                </h2>
                <div
                    className="calendario flex justify-center bg-neutral-800 rounded-lg mx-auto p-4"
                    style={{ width: "90vw" }}
                >
                    <CustomCalendar daysWithSession={daysWithSession} />
                </div>
            </div>
        </div>
    );
}

export default Progreso;
