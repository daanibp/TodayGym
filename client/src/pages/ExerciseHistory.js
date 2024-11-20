import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { IoMdArrowRoundBack } from "react-icons/io";

function ExerciseHistory() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { type, exercise_name } = location.state || {};

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const getHistory = async () => {
            try {
                const response = await fetch(
                    `https://regymserver.onrender.com/exercises/getExerciseHistory?userId=${user.id}&exercise_name=${exercise_name}&type=${type}`
                );
                if (!response.ok) {
                    setHistory([]);
                } else {
                    const data = await response.json();
                    setHistory(data || []);
                    console.log("History", data);
                }
            } catch (error) {
                console.error("Failed to fetch exercise history:", error);
                setHistory([]);
            }
        };

        getHistory();
    }, [user.id, type, exercise_name]);

    const goBack = () => {
        navigate("/progress");
    };

    return (
        <div className="h-full overflow-hidden">
            <div
                className="top flex items-center justify-between text-lg font-bold"
                style={{ backgroundColor: "#890000" }}
            >
                <div className="w-1/6 flex text-white justify-center items-center">
                    <button
                        className="w-full flex items-center justify-center text-center"
                        onClick={() => goBack()}
                    >
                        <IoMdArrowRoundBack className="text-center justify-center items-center w-full" />
                    </button>
                </div>
                <div className="title flex text-white items-center justify-center py-1 w-full">
                    {exercise_name}
                </div>
                <div className="w-1/6"></div>
            </div>
            {!history || history.length === 0 ? (
                <p className="text-gray-300 m-4">
                    No se encontraron sets asociados.
                </p>
            ) : (
                <div
                    className="h-full overflow-auto pb-[200px] mt-4 mx-auto text-gray-300"
                    style={{ width: "90%" }}
                >
                    {Object.entries(history).map(([exerciseId, exercise]) => (
                        <div
                            key={exerciseId}
                            className="exercise-section border p-2"
                        >
                            <h3>
                                {exercise.session_date} - {exercise.start_time}
                            </h3>
                            {exercise.notes != null && (
                                <p>
                                    <span style={{ fontWeight: "bold" }}>
                                        Notas:
                                    </span>{" "}
                                    {exercise.notes}
                                </p>
                            )}

                            {/* Condicional para mostrar sets o intervals dependiendo del tipo */}
                            {type === "Pesas" ? (
                                // Mostrar los sets si el tipo es "Pesas"
                                exercise.sets.length === 0 ? (
                                    <p className="text-left">
                                        Sin sets asociados
                                    </p>
                                ) : (
                                    <table className="exercise-table w-full">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "30%" }}>
                                                    Set
                                                </th>
                                                <th style={{ width: "35%" }}>
                                                    Peso
                                                </th>
                                                <th style={{ width: "35%" }}>
                                                    Reps
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exercise.sets.map((set, index) => (
                                                <tr key={index}>
                                                    <td className="text-center align-middle">
                                                        {set.set_number}
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        {set.weight != null
                                                            ? `${set.weight} kg`
                                                            : "-"}
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        {set.reps != null
                                                            ? set.reps
                                                            : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : type === "Cardio" ? (
                                // Mostrar los intervals si el tipo es "Cardio"
                                exercise.intervals.length === 0 ? (
                                    <p className="text-left">
                                        Sin intervalos asociados
                                    </p>
                                ) : (
                                    <table className="exercise-table w-full">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "30%" }}>
                                                    Intervalo
                                                </th>
                                                <th style={{ width: "35%" }}>
                                                    Distancia
                                                </th>
                                                <th style={{ width: "35%" }}>
                                                    Duración
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exercise.intervals.map(
                                                (interval, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center align-middle">
                                                            {
                                                                interval.interval_number
                                                            }
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            {interval.distance !=
                                                            null
                                                                ? `${interval.distance} km`
                                                                : "-"}
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            {interval.duration !=
                                                            null
                                                                ? `${interval.duration} min`
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                <p className="text-left">
                                    Tipo de ejercicio no válido
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ExerciseHistory;
