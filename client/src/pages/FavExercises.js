import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

function FavExercises() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const type = location.state?.type;

    const [exercises, setExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredExercises, setFilteredExercises] = useState({});

    // Fetch exercises when the component mounts
    useEffect(() => {
        const getExercises = async () => {
            const response = await fetch(
                `http://localhost:8080/exercises/getAllExercisesById?userId=${user.id}&type=${type}`
            );
            const data = await response.json();
            setExercises(data.exercises || []); // Evitar que sea undefined
            setFilteredExercises(groupByCategory(data.exercises || [])); // Usar un array vacío si no hay datos
            console.log("Ejercicios:", data.exercises);
        };
        getExercises();
    }, [user.id, type]);

    // Agrupar los ejercicios por categoría
    const groupByCategory = (exercisesList) => {
        if (!Array.isArray(exercisesList)) {
            return {}; // Retornar un objeto vacío si exercisesList no es un array
        }
        return exercisesList.reduce((acc, exercise) => {
            if (!acc[exercise.category]) {
                acc[exercise.category] = [];
            }
            acc[exercise.category].push(exercise);
            return acc;
        }, {});
    };

    // Filtrar y agrupar los ejercicios según el término de búsqueda
    useEffect(() => {
        if (searchTerm === "") {
            setFilteredExercises(groupByCategory(exercises));
        } else {
            const filtered = exercises.filter((exercise) =>
                exercise.exercise_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
            setFilteredExercises(groupByCategory(filtered));
        }
    }, [searchTerm, exercises]);

    const goBack = () => {
        navigate("/progress");
    };

    // Toggle fav status of exercise
    const toggleFav = async (exercise) => {
        const updatedExercise = { ...exercise, fav: !exercise.fav }; // Toggle fav status

        try {
            // Update on server
            await fetch(`http://localhost:8080/exercises/${exercise.id}/fav`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fav: updatedExercise.fav }),
            });
            // Update local state
            setExercises((prevExercises) =>
                prevExercises.map((ex) =>
                    ex.id === exercise.id ? updatedExercise : ex
                )
            );
        } catch (error) {
            console.error("Error in toggleFav:", error);
        }
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
                    EJERCICIOS FAVORITOS
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
            <div className="allExercises h-full mt-4 w-full">
                <div className="bg bg-neutral-700 rounded-3xl h-full overflow-y-auto p-4 pb-[200px]">
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
                                                className="exerciseItem w-full h-auto flex flex-col items-center"
                                            >
                                                <img
                                                    src={`/images/exercises/${exercise.image}`}
                                                    alt={exercise.exercise_name}
                                                    className="w-28 h-28 object-cover mb-2 cursor-pointer"
                                                    onClick={() =>
                                                        toggleFav(exercise)
                                                    }
                                                />
                                                <p className="text-center text-white mb-4 w-full break-words cursor-pointer">
                                                    <span
                                                        style={{
                                                            color: exercise.fav
                                                                ? "yellow"
                                                                : "white",
                                                        }}
                                                    >
                                                        {exercise.fav
                                                            ? "★"
                                                            : "☆"}{" "}
                                                        {exercise.exercise_name}
                                                    </span>
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

export default FavExercises;
