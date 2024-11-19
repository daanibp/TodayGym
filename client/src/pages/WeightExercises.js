import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { SessionContext } from "../context/SessionContext";
import exercisesData from "../exercises.json";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

function WeightExercises() {
    const { user } = useContext(AuthContext);
    const [exercisesByCategory, setExercisesByCategory] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const {
        selectedDate,
        sessionIdPesas,
        //updateSelectedDate,
        updateSessionIdPesas,
    } = useContext(SessionContext);

    const formatLocalDate = (date) => {
        const year = date.getFullYear(); // 2024
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 11 -> "11"
        const day = date.getDate().toString().padStart(2, "0"); // 5 -> "05"

        return `${year}-${month}-${day}`; // 2024-11-05
    };

    useEffect(() => {
        // Agrupar los ejercicios por categoría
        const groupedExercises = exercisesData.reduce((acc, exercise) => {
            if (!acc[exercise.category]) {
                acc[exercise.category] = [];
            }
            acc[exercise.category].push(exercise);
            return acc;
        }, {});
        setExercisesByCategory(groupedExercises);
    }, []);

    // Filtrar ejercicios por el término de búsqueda
    const filteredExercises = Object.keys(exercisesByCategory).reduce(
        (acc, category) => {
            const exercisesInCategory = exercisesByCategory[category].filter(
                (exercise) =>
                    exercise.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );

            if (exercisesInCategory.length > 0) {
                acc[category] = exercisesInCategory; // Solo incluir categorías con ejercicios que coincidan
            }
            return acc;
        },
        {}
    );

    // Añadir ejercicio a la sesión
    const addExercise = async (exercise, category, image) => {
        console.log("Exercise: ", exercise);
        let idSession = sessionIdPesas;

        const sessionDate = formatLocalDate(selectedDate);

        try {
            const response = await fetch(
                `http://localhost:8080/sessions/pesas/getSessionByDate/${sessionDate}`
            );

            if (!response.ok) {
                // Crear sesion si no hay ninguna
                console.log("Creando una sesión nueva...");
                const session = createSession("Pesas");
                try {
                    const response = await fetch(
                        `http://localhost:8080/sessions/pesas/${sessionDate}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(session),
                        }
                    );

                    if (response.ok) {
                        const sessionData = await response.json();
                        console.log("SessionData: ", sessionData);
                        idSession = sessionData.id;
                        updateSessionIdPesas(sessionData.id);
                    } else {
                        console.error("Failed to create or fetch session.");
                    }
                } catch (error) {
                    console.error("Error creating or fetching session:", error);
                }
            }
        } catch (error) {
            console.error("Error getting session by date:", error);
        }

        const newExercise = createExercise(
            idSession,
            exercise.name,
            category,
            image
        );
        console.log("newExercise: ", newExercise);

        const response = await fetch("http://localhost:8080/exercises", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newExercise),
        });
        if (!response.ok) {
            console.error("Error by adding the new exercise.");
        }

        navigate("/diary", {
            state: { currentView: "pesas" },
        });
    };

    // Crear ejercicio
    function createExercise(session_id, exercise_name, category, image) {
        const today = new Date();

        // Formatear la hora actual como HH:mm:ss
        const start_time = today.toTimeString().split(" ")[0]; // 'HH:mm:ss'

        const end_time = null;
        const duration = null;

        const notes = null;

        const exercise = {
            session_id: session_id,
            exercise_name: exercise_name,
            category: category,
            image: image,
            start_time: start_time,
            end_time: end_time,
            duration: duration,
            notes: notes,
            fav: 0,
        };

        return exercise;
    }

    function createSession(type) {
        const today = new Date();

        // Obtener la fecha en formato YYYY-MM-DD
        const session_date = formatLocalDate(selectedDate); // 'YYYY-MM-DD'

        // Formatear la hora actual como HH:mm:ss
        const start_time = today.toTimeString().split(" ")[0]; // 'HH:mm:ss'

        const end_time = null;
        const duration = null;

        const session = {
            user_id: user.id,
            session_date: session_date,
            start_time: start_time,
            end_time: end_time,
            duration: duration,
            type: type,
        };

        return session;
    }

    const goBack = () => {
        navigate("/diary", {
            state: { currentView: "pesas" },
        });
    };

    return (
        <div className="weightExercises h-full overflow-hidden">
            <div className="top fixed w-full">
                <div
                    className="top2 w-full flex items-center justify-between text-lg font-bold"
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
                        ENTRENAMIENTO DE PESAS
                    </div>
                    <div className="w-1/6"></div>
                </div>

                <div className="searchExercises text-lg w-full font-light mt-6">
                    <input
                        type="text"
                        placeholder="Busca un ejercicio..."
                        className="w-full py-2 px-4 text-lg bg-neutral-700 text-white rounded-full outline-none"
                        value={searchTerm} // Enlazar el valor del input con el estado
                        onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el estado en tiempo real
                    />
                </div>
            </div>
            <div className="allExercises flex h-full w-full pt-[120px]">
                <div
                    className="bg w-full bg-neutral-700 rounded-3xl overflow-y-auto p-4 pb-[200px]"
                    style={{ height: "calc(100vh - 100px)" }}
                >
                    {Object.keys(filteredExercises).length > 0 ? (
                        Object.keys(filteredExercises).map((category) => (
                            <div
                                key={category}
                                className="category-section mb-8"
                            >
                                <h2 className="text-white text-xl mb-4">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {filteredExercises[category].map(
                                        (exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="exerciseItem w-full h-auto flex flex-col items-center "
                                            >
                                                <img
                                                    src={`/images/exercises/${exercise.image}`}
                                                    alt={exercise.name}
                                                    className="w-28 h-28 object-cover mb-2 cursor-pointer"
                                                    onClick={() =>
                                                        addExercise(
                                                            exercise,
                                                            category,
                                                            exercise.image
                                                        )
                                                    }
                                                />
                                                <p className="text-center text-white mb-4 w-full break-words cursor-pointer">
                                                    {exercise.name}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white">
                            No se encontraron ejercicios.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WeightExercises;
