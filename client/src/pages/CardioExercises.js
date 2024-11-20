import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { SessionContext } from "../context/SessionContext";
import exercisesCardioData from "../exercisesCardio.json";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

function CardioExercises() {
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredExercises, setFilteredExercises] =
        useState(exercisesCardioData);
    const navigate = useNavigate();

    const {
        selectedDate,
        sessionIdCardio,
        //updateSelectedDate,
        updateSessionIdCardio,
    } = useContext(SessionContext);

    const formatLocalDate = (date) => {
        const year = date.getFullYear(); // 2024
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 11 -> "11"
        const day = date.getDate().toString().padStart(2, "0"); // 5 -> "05"

        return `${year}-${month}-${day}`; // 2024-11-05
    };

    // Filtrar ejercicios en función del término de búsqueda
    useEffect(() => {
        const results = exercisesCardioData.filter((exercise) =>
            exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredExercises(results);
    }, [searchTerm]);

    // Añadir ejercicio a la sesión
    const addExercise = async (exercise, image) => {
        console.log("Exercise: ", exercise);
        let idSession = sessionIdCardio;

        const sessionDate = formatLocalDate(selectedDate);

        try {
            const response = await fetch(
                `https://regymserver.onrender.com/vsessions/cardio/getSessionByDate/${sessionDate}`
            );

            if (!response.ok) {
                console.log("Creando una sesión nueva...");
                const session = createSession("Cardio");
                try {
                    const response = await fetch(
                        `https://regymserver.onrender.com/sessions/cardio/${sessionDate}`,
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
                        updateSessionIdCardio(sessionData.id);
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

        const newExercise = createExercise(idSession, exercise.name, image);
        console.log("newExercise: ", newExercise);

        const response = await fetch(
            "https://regymserver.onrender.com/exercises",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newExercise),
            }
        );
        if (!response.ok) {
            console.error("Error by adding the new exercise.");
        }

        navigate("/diary", {
            state: { currentView: "cardio" },
        });
    };

    // Crear ejercicio
    function createExercise(session_id, exercise_name, image) {
        const today = new Date();
        const start_time = today.toTimeString().split(" ")[0];
        const end_time = null;
        const duration = null;
        const notes = null;

        return {
            session_id: session_id,
            exercise_name: exercise_name,
            category: "Cardio",
            image: image,
            start_time: start_time,
            end_time: end_time,
            duration: duration,
            notes: notes,
            fav: 0,
        };
    }

    function createSession(type) {
        const today = new Date();
        const session_date = formatLocalDate(selectedDate);
        const start_time = today.toTimeString().split(" ")[0];

        return {
            user_id: user.id,
            session_date: session_date,
            start_time: start_time,
            end_time: null,
            duration: null,
            type: type,
        };
    }

    const goBack = () => {
        navigate("/diary", {
            state: { currentView: "cardio" },
        });
    };

    return (
        <div className="cardioExercises h-full overflow-hidden">
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
                        ENTRENAMIENTO DE CARDIO
                    </div>
                    <div className="w-1/6"></div>
                </div>

                <div className="searchExercises text-lg w-full font-light mt-6">
                    <input
                        type="text"
                        placeholder="Busca un ejercicio..."
                        className="w-full py-2 px-4 text-lg bg-neutral-700 text-white rounded-full outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="allExercises flex h-full w-full pt-[120px]">
                <div
                    className="bg bg-neutral-700 rounded-3xl w-full overflow-y-auto p-4"
                    style={{ height: "calc(100vh - 100px)" }}
                >
                    {filteredExercises.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {filteredExercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    className="exerciseItem flex flex-col items-center "
                                >
                                    <img
                                        src={`/images/exercises/${exercise.image}`}
                                        alt={exercise.name}
                                        className="w-28 h-28 object-cover mb-2 cursor-pointer"
                                        onClick={() =>
                                            addExercise(
                                                exercise,
                                                exercise.image
                                            )
                                        }
                                    />
                                    <p className="text-center text-white mb-4 w-full break-words cursor-pointer">
                                        {exercise.name}
                                    </p>
                                </div>
                            ))}
                        </div>
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

export default CardioExercises;
