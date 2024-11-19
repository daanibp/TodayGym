import express from "express";
import Exercise from "../models/exercise.js";
import Session from "../models/session.js";
import Set from "../models/set.js";
import Interval from "../models/interval.js";
import { Op } from "sequelize";

const router = express.Router();

// GET all exercises
router.get("/", async (req, res) => {
    try {
        const exercises = await Exercise.findAll();
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve exercises" });
    }
});

// POST a new exercise
router.post("/", async (req, res) => {
    try {
        const newExercise = await Exercise.create(req.body);
        res.status(201).json(newExercise);
    } catch (error) {
        res.status(500).json({ error: "Failed to create exercise" });
    }
});

router.get("/getExerciseBySessionId/:session_id", async (req, res) => {
    const { session_id } = req.params;

    try {
        const exercises = await Exercise.findAll({
            where: {
                session_id: session_id,
            },
        });

        if (exercises.length === 0) {
            return res
                .status(404)
                .json({ message: "No exercises found for this session" });
        }

        res.status(200).json(exercises);
    } catch (error) {
        console.error("Error fetching exercises:", error);
        res.status(500).json({ error: "Failed to fetch exercises" });
    }
});

router.delete("/deleteById/:exerciseId", async (req, res) => {
    const { exerciseId } = req.params;
    const { userId, selectedDate } = req.query;

    try {
        const exerciseToDelete = await Exercise.findOne({
            where: { id: exerciseId },
            include: {
                model: Session,
                attributes: ["type", "session_date"],
            },
        });

        if (!exerciseToDelete) {
            return res.status(404).json({ error: "Ejercicio no encontrado" });
        }

        const exerciseType = exerciseToDelete.Session.type;
        const exerciseName = exerciseToDelete.exercise_name;

        if (exerciseType === "Pesas") {
            // Obtenemos los sets del ejercicio a borrar
            const setsToDelete = await Set.findAll({
                where: { exercise_id: exerciseId },
                order: [["set_number", "ASC"]],
            });

            // Obtenemos las sessions a partir de la actual
            const sessions = await Session.findAll({
                where: {
                    user_id: userId,
                    session_date: { [Op.gt]: selectedDate },
                },
                order: [["session_date", "ASC"]],
            });

            let nextExercises = [];

            for (const session of sessions) {
                // Buscamos todos los ejercicios con el mismo nombre para cada sesión
                const exercises = await Exercise.findAll({
                    where: {
                        session_id: session.id,
                        exercise_name: exerciseName,
                    },
                    order: [["start_time", "ASC"]], // Ordenamos por el tiempo de inicio del ejercicio
                });

                // Agregamos los ejercicios encontrados a nextExercises
                nextExercises = nextExercises.concat(exercises);
            }

            let setsArrastrados = [];

            if (nextExercises.length > 0) {
                console.log("NextExercise.length:", nextExercises.length);
                for (const exercise of nextExercises) {
                    console.log("NextExerciseeeeeeeeeeeeee:", exercise);
                    // Cogemos los sets del ejercicio siguiente
                    const setsToUpdate = await Set.findAll({
                        where: { exercise_id: exercise.id },
                        order: [["set_number", "ASC"]],
                    });

                    console.log("Sets To Update:", setsToUpdate);

                    for (const set of setsToUpdate) {
                        console.log("Set:", set);
                        const matchingSet = setsToDelete.find(
                            (s) => s.set_number === set.set_number
                        );
                        console.log("Matching Set:", matchingSet);
                        const lastValue = matchingSet.lastValue;
                        console.log("Last Value:", lastValue);
                        await set.update({ lastValue });
                        console.log("Set final:", set);
                        // El siguiente también dependía de este lastValue
                        console.log("set.weight", set.weight);
                        if (set.weight === null || set.reps === null) {
                            setsArrastrados = setsArrastrados.concat(set);
                        }
                    }
                    console.log("SetsArrastrados", setsArrastrados);

                    if (setsArrastrados.length === 0) {
                        break;
                    }
                }
            }

            await Exercise.destroy({ where: { id: exerciseId } });

            res.status(200).json({
                message: "Ejercicio eliminado exitosamente",
                exerciseType,
            });
        } else if (exerciseType === "Cardio") {
            const intervalsToDelete = await Interval.findAll({
                where: { exercise_id: exerciseId },
                order: [["interval_number", "ASC"]],
            });

            const sessions = await Session.findAll({
                where: {
                    user_id: userId,
                    session_date: { [Op.gt]: selectedDate },
                },
                order: [["session_date", "ASC"]],
            });

            let nextExercise = null;

            for (const session of sessions) {
                nextExercise = await Exercise.findOne({
                    where: {
                        session_id: session.id,
                        exercise_name: exerciseName,
                    },
                    order: [["start_time", "ASC"]],
                });
                if (nextExercise) break;
            }

            if (nextExercise) {
                const intervalsToUpdate = await Interval.findAll({
                    where: { exercise_id: nextExercise.id },
                    order: [["interval_number", "ASC"]],
                });

                for (const interval of intervalsToUpdate) {
                    const matchingInterval = intervalsToDelete.find(
                        (i) => i.interval_number === interval.interval_number
                    );
                    const lastValue = matchingInterval.lastValue;
                    await interval.update({ lastValue });
                }
            }

            await Exercise.destroy({ where: { id: exerciseId } });

            res.status(200).json({
                message: "Ejercicio eliminado exitosamente",
                exerciseType,
            });
        } else {
            return res
                .status(400)
                .json({ error: "Tipo de ejercicio no reconocido" });
        }
    } catch (error) {
        console.error("Error eliminando el ejercicio:", error);
        res.status(500).json({ error: "Error eliminando el ejercicio" });
    }
});

router.put("/:id/notes", async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        const exercise = await Exercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        await exercise.update({ notes });
        res.status(200).json({
            message: "Notes updated successfully",
            exercise,
        });
    } catch (error) {
        console.error("Error updating notes:", error);
        res.status(500).json({ error: "Error updating notes" });
    }
});

// Ruta para obtener los ejercicios favoritos de "Pesas"
router.get("/pesas/getExercisesFav/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        // Paso 1: Obtener todas las sesiones asociadas al usuario
        const sessions = await Session.findAll({
            where: { user_id: userId, type: "Pesas" },
            attributes: ["id"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: "Sessions not found" });
        }

        // Paso 2: Obtener los ejercicios favoritos
        const sessionIds = sessions.map((session) => session.id);
        const favoriteExercises = await Exercise.findAll({
            where: {
                session_id: sessionIds,
                fav: true,
            },
        });

        // Verificar si hay ejercicios favoritos
        if (!favoriteExercises || favoriteExercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No favourite exercises found" });
        }

        // Paso 3: Agrupar los ejercicios por `exercise_name`
        const groupedExercises = favoriteExercises.reduce((acc, exercise) => {
            if (!acc[exercise.exercise_name]) {
                acc[exercise.exercise_name] = [];
            }
            acc[exercise.exercise_name].push(exercise);
            return acc;
        }, {});

        // Paso 4: Calcular estadísticas para cada grupo de ejercicios
        const exercisesWithStats = await Promise.all(
            Object.keys(groupedExercises).map(async (exerciseName) => {
                const exercises = groupedExercises[exerciseName];

                // Obtener todas las series asociadas a estos ejercicios
                const sets = await Set.findAll({
                    where: {
                        exercise_id: exercises.map((exercise) => exercise.id),
                    },
                    attributes: ["weight", "reps", "set_number"],
                });

                // Calcular el peso máximo levantado
                const maxWeight = sets.reduce(
                    (max, set) => Math.max(max, set.weight),
                    0
                );

                // Calcular el volumen máximo (peso * repeticiones)
                const maxVolumeSet = sets.reduce(
                    (maxSet, set) => {
                        const volume = set.weight * set.reps;
                        if (volume > maxSet.volume) {
                            return {
                                weight: set.weight,
                                reps: set.reps,
                                volume,
                            };
                        }
                        return maxSet;
                    },
                    { weight: 0, reps: 0, volume: 0 }
                );

                // Calcular las mejores series por set_number
                const bestSets = [];
                for (const set of sets) {
                    if (set.weight === null || set.reps === null) continue;
                    const volume = set.weight * set.reps;
                    const existingSet = bestSets.find(
                        (s) => s.set_number === set.set_number
                    );

                    if (!existingSet || volume > existingSet.best_volume) {
                        if (existingSet) {
                            existingSet.best_volume = volume;
                            existingSet.weight = set.weight;
                            existingSet.reps = set.reps;
                        } else {
                            bestSets.push({
                                set_number: set.set_number,
                                best_volume: volume,
                                weight: set.weight,
                                reps: set.reps,
                            });
                        }
                    }
                }

                // Estructura la respuesta con las estadísticas
                return {
                    exercise_name: exerciseName,
                    max_weight: maxWeight,
                    max_volume: `${maxVolumeSet.weight}kg x ${maxVolumeSet.reps}`,
                    best_sets: bestSets.sort(
                        (a, b) => a.set_number - b.set_number
                    ), // Ordenar por número de set
                };
            })
        );

        // Paso 5: Calcular el número máximo de sets de todos los ejercicios
        const maxSets = exercisesWithStats.reduce((max, exercise) => {
            const numSets = exercise.best_sets.length;
            return numSets > max ? numSets : max;
        }, 0);

        // Enviar la respuesta con los ejercicios favoritos y sus estadísticas
        res.status(200).json({
            exercisesFav: exercisesWithStats,
            max: maxSets, // Añadir el número máximo de sets en la respuesta
        });
    } catch (error) {
        console.error("Error getting favourite exercises:", error);
        res.status(500).json({ error: "Error getting favourite exercises" });
    }
});

// Ruta para obtener los ejercicios favoritos de "Cardio"
router.get("/cardio/getExercisesFav/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        // Paso 1: Obtener todas las sesiones asociadas al usuario
        const sessions = await Session.findAll({
            where: { user_id: userId, type: "Cardio" },
            attributes: ["id"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: "Sessions not found" });
        }

        // Paso 2: Obtener los ejercicios favoritos
        const sessionIds = sessions.map((session) => session.id);
        const favoriteExercises = await Exercise.findAll({
            where: {
                session_id: sessionIds,
                fav: true,
            },
        });

        // Verificar si hay ejercicios favoritos
        if (!favoriteExercises || favoriteExercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No favourite exercises found" });
        }

        // Paso 3: Agrupar los ejercicios por `exercise_name`
        const groupedExercises = favoriteExercises.reduce((acc, exercise) => {
            if (!acc[exercise.exercise_name]) {
                acc[exercise.exercise_name] = [];
            }
            acc[exercise.exercise_name].push(exercise);
            return acc;
        }, {});

        // Paso 4: Calcular estadísticas para cada grupo de ejercicios
        const exercisesWithStats = await Promise.all(
            Object.keys(groupedExercises).map(async (exerciseName) => {
                const exercises = groupedExercises[exerciseName];

                // Obtener todas las series asociadas a estos ejercicios
                const intervals = await Interval.findAll({
                    where: {
                        exercise_id: exercises.map((exercise) => exercise.id),
                    },
                    attributes: ["distance", "duration", "interval_number"],
                });

                // Calcular la distancia máxima
                const maxDistance = intervals.reduce(
                    (max, interval) => Math.max(max, interval.distance),
                    0
                );

                // Calcular la duración máxima
                const maxDuration = intervals.reduce(
                    (max, interval) => Math.max(max, interval.duration),
                    0
                );

                // Calcular la velocidad media máxima
                const maxAvgSpeed = intervals.reduce(
                    (maxInterval, interval) => {
                        const volume = interval.distance / interval.duration;
                        if (volume > maxInterval.volume) {
                            return {
                                distance: interval.distance,
                                duration: interval.duration,
                                volume,
                            };
                        }
                        return maxInterval;
                    },
                    { distance: 0, duration: 0, volume: 0 }
                );

                // Calcular las mejores series por intervalo_number
                const bestIntervals = [];
                for (const interval of intervals) {
                    if (
                        interval.distance === null ||
                        interval.duration === null
                    )
                        continue;
                    const volume = interval.distance / (interval.duration / 60);
                    const existingInterval = bestIntervals.find(
                        (s) => s.interval_number === interval.interval_number
                    );

                    if (
                        !existingInterval ||
                        volume > existingInterval.best_volume
                    ) {
                        if (existingInterval) {
                            existingInterval.best_volume = volume;
                            existingInterval.distance = interval.distance;
                            existingInterval.duration = interval.duration;
                        } else {
                            bestIntervals.push({
                                interval_number: interval.interval_number,
                                best_volume: volume,
                                distance: interval.distance,
                                duration: interval.duration,
                            });
                        }
                    }
                }

                // Estructura la respuesta con las estadísticas
                return {
                    exercise_name: exerciseName,
                    max_duration: maxDuration,
                    max_distance: maxDistance,
                    max_volume: isNaN(
                        maxAvgSpeed.distance / (maxAvgSpeed.duration / 60)
                    )
                        ? "0 km / h"
                        : `${(
                              maxAvgSpeed.distance /
                              (maxAvgSpeed.duration / 60)
                          ).toFixed(2)} km / h`,
                    best_intervals: bestIntervals.sort(
                        (a, b) => a.interval_number - b.interval_number
                    ),
                };
            })
        );

        // Paso 5: Calcular el número máximo de intervalos
        const maxIntervals = exercisesWithStats.reduce((max, exercise) => {
            const numIntervals = exercise.best_intervals.length;
            return numIntervals > max ? numIntervals : max;
        }, 0);

        // Enviar la respuesta con los ejercicios favoritos y sus estadísticas
        res.status(200).json({
            exercisesFav: exercisesWithStats,
            max: maxIntervals, // Añadir el número máximo de intervalos en la respuesta
        });
    } catch (error) {
        console.error("Error getting favourite exercises:", error);
        res.status(500).json({ error: "Error getting favourite exercises" });
    }
});

router.get("/getAllExercisesById", async (req, res) => {
    const { userId, type } = req.query;

    try {
        // Step 1: Get all sessions associated with the user
        const sessions = await Session.findAll({
            where: { user_id: userId, type: type },
            attributes: ["id"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: "Sessions not found" });
        }

        // Step 2: Extract session IDs and use them to query exercises
        const sessionIds = sessions.map((session) => session.id);
        const exercises = await Exercise.findAll({
            where: {
                session_id: sessionIds,
            },
        });

        if (!exercises || exercises.length === 0) {
            return res.status(404).json({ error: "No exercises found" });
        }

        const uniqueExercises = exercises.filter(
            (exercise, index, self) =>
                index ===
                self.findIndex(
                    (e) => e.exercise_name === exercise.exercise_name
                )
        );

        res.status(200).json({ exercises: uniqueExercises });
    } catch (error) {
        console.error("Error getting exercises:", error);
        res.status(500).json({ error: "Error getting exercises" });
    }
});

router.put("/:id/fav", async (req, res) => {
    const { id } = req.params;
    const { fav } = req.body;

    try {
        // Encontrar el ejercicio que se está modificando
        const exercise = await Exercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        // Actualizar el estado de 'fav' para todos los ejercicios con el mismo 'exercise_name'
        await Exercise.update(
            { fav },
            {
                where: { exercise_name: exercise.exercise_name },
            }
        );

        // Obtener los ejercicios actualizados para enviarlos como respuesta
        const updatedExercises = await Exercise.findAll({
            where: { exercise_name: exercise.exercise_name },
        });

        res.status(200).json({
            message: "Fav state updated for all exercises with the same name",
            exercises: updatedExercises,
        });
    } catch (error) {
        console.error("Error updating fav exercise:", error);
        res.status(500).json({ error: "Error updating fav exercise" });
    }
});

router.get("/getMaxWeightBySession", async (req, res) => {
    const { userId, exercise_name } = req.query;

    try {
        // Obtener todas las sesiones del usuario
        const sessions = await Session.findAll({
            where: { user_id: userId, type: "Pesas" },
            attributes: ["id", "session_date"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: "No sessions found" });
        }

        // Obtener los IDs de las sesiones
        const sessionIds = sessions.map((session) => session.id);

        // Buscar los ejercicios con el nombre especificado
        const exercises = await Exercise.findAll({
            where: {
                session_id: sessionIds,
                exercise_name,
            },
            attributes: ["id", "session_id"],
        });

        if (!exercises || exercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No exercises found for this name" });
        }

        // Crear un mapa de ejercicios por sesión
        const exerciseMap = {};
        exercises.forEach((exercise) => {
            if (!exerciseMap[exercise.session_id]) {
                exerciseMap[exercise.session_id] = [];
            }
            exerciseMap[exercise.session_id].push(exercise.id);
        });

        // Buscar sets asociados con los ejercicios encontrados
        const sets = await Set.findAll({
            where: {
                exercise_id: exercises.map((exercise) => exercise.id),
            },
            attributes: ["exercise_id", "weight"],
        });

        if (!sets || sets.length === 0) {
            return res
                .status(404)
                .json({ error: "No sets found for the specified exercises" });
        }

        // Calcular el peso máximo por sesión
        const sessionMaxWeights = Object.keys(exerciseMap).map((sessionId) => {
            const exerciseIds = exerciseMap[sessionId];
            const maxWeight = sets
                .filter((set) => exerciseIds.includes(set.exercise_id))
                .reduce((max, set) => Math.max(max, set.weight), 0);

            const session = sessions.find(
                (session) => session.id === parseInt(sessionId)
            );

            return {
                session_date: session ? session.session_date : null,
                max_weight: maxWeight,
                exercise_name,
            };
        });

        // Ordenar los datos por session_date (de más antigua a más nueva)
        sessionMaxWeights.sort((a, b) => {
            const dateA = new Date(a.session_date);
            const dateB = new Date(b.session_date);
            return dateA - dateB; // Ascendente: más antigua primero
        });

        res.status(200).json(sessionMaxWeights);
    } catch (error) {
        console.error("Error getting max weights by session:", error);
        res.status(500).json({ error: "Error getting max weights by session" });
    }
});

router.get("/getMaxAvgSpeedBySession", async (req, res) => {
    const { userId, exercise_name } = req.query;

    try {
        // Obtener todas las sesiones del usuario
        const sessions = await Session.findAll({
            where: { user_id: userId, type: "Cardio" },
            attributes: ["id", "session_date"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: "No sessions found" });
        }

        // Obtener los IDs de las sesiones
        const sessionIds = sessions.map((session) => session.id);

        // Buscar los ejercicios con el nombre especificado
        const exercises = await Exercise.findAll({
            where: {
                session_id: sessionIds,
                exercise_name,
            },
            attributes: ["id", "session_id"],
        });

        if (!exercises || exercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No exercises found for this name" });
        }

        // Crear un mapa de ejercicios por sesión
        const exerciseMap = {};
        exercises.forEach((exercise) => {
            if (!exerciseMap[exercise.session_id]) {
                exerciseMap[exercise.session_id] = [];
            }
            exerciseMap[exercise.session_id].push(exercise.id);
        });

        // Buscar intervals asociados con los ejercicios encontrados
        const intervals = await Interval.findAll({
            where: {
                exercise_id: exercises.map((exercise) => exercise.id),
            },
            attributes: ["exercise_id", "distance", "duration"],
        });

        if (!intervals || intervals.length === 0) {
            return res.status(404).json({
                error: "No intervals found for the specified exercises",
            });
        }

        // Calcular la mayor avg speed por sesión
        const sessionMaxAvgSpeed = Object.keys(exerciseMap).map((sessionId) => {
            const exerciseIds = exerciseMap[sessionId];
            const maxAvgSpeed = intervals
                .filter((interval) =>
                    exerciseIds.includes(interval.exercise_id)
                )
                .reduce((max, interval) => {
                    const avgSpeed =
                        interval.duration > 0
                            ? interval.distance / (interval.duration / 60)
                            : 0;
                    return Math.max(max, avgSpeed);
                }, 0);

            const session = sessions.find(
                (session) => session.id === parseInt(sessionId)
            );

            return {
                session_date: session ? session.session_date : null,
                max_avgSpeed: maxAvgSpeed,
                exercise_name,
            };
        });

        // Ordenar los resultados por session_date (de más antigua a más nueva)
        sessionMaxAvgSpeed.sort((a, b) => {
            const dateA = new Date(a.session_date);
            const dateB = new Date(b.session_date);
            return dateA - dateB; // Ascendente: más antigua primero
        });

        res.status(200).json(sessionMaxAvgSpeed);
    } catch (error) {
        console.error("Error getting max avg speed by session:", error);
        res.status(500).json({
            error: "Error getting max avg speed by session",
        });
    }
});

router.get("/getExerciseHistory", async (req, res) => {
    const { userId, exercise_name, type } = req.query;

    try {
        // Obtener todas las sesiones del usuario
        const sessions = await Session.findAll({
            where: { user_id: userId, type: type },
            attributes: ["id", "session_date"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: "No sessions found" });
        }

        // Obtener los IDs de las sesiones
        const sessionIds = sessions.map((session) => session.id);

        // Buscar los ejercicios con el nombre especificado
        const exercises = await Exercise.findAll({
            where: {
                session_id: sessionIds,
                exercise_name,
            },
            attributes: [
                "id",
                "session_id",
                "exercise_name",
                "category",
                "image",
                "notes",
                "start_time",
            ],
        });

        if (!exercises || exercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No exercises found for this name" });
        }

        if (type === "Pesas") {
            // Buscar sets asociados con los ejercicios encontrados
            const sets = await Set.findAll({
                where: {
                    exercise_id: exercises.map((exercise) => exercise.id),
                },
                attributes: ["exercise_id", "set_number", "weight", "reps"],
            });

            if (!sets || sets.length === 0) {
                return res.status(404).json({
                    error: "No sets found for the specified exercises",
                });
            }

            // Combinar datos de ejercicios y sets
            const history = exercises.reduce((result, exercise) => {
                const session = sessions.find(
                    (session) => session.id === exercise.session_id
                );

                const exerciseSets = sets
                    .filter((set) => set.exercise_id === exercise.id)
                    .map((set) => ({
                        set_number: set.set_number,
                        weight: set.weight,
                        reps: set.reps,
                    }));

                result[exercise.id] = {
                    session_date: session ? session.session_date : null,
                    exercise_name: exercise.exercise_name,
                    category: exercise.category,
                    image: exercise.image,
                    notes: exercise.notes,
                    start_time: exercise.start_time,
                    sets: exerciseSets,
                };

                return result;
            }, {});

            // Convertir el objeto history en un array y ordenarlo por session_date y start_time
            const historyArray = Object.values(history).sort((a, b) => {
                // Primero ordenamos por fecha de sesión (session_date)
                const dateA = new Date(a.session_date);
                const dateB = new Date(b.session_date);
                if (dateA > dateB) return -1; // Si la fecha de A es más reciente que la de B, A va primero
                if (dateA < dateB) return 1;

                // Si las fechas son iguales, ordenamos por hora de inicio (start_time)
                const timeA = new Date(a.start_time);
                const timeB = new Date(b.start_time);
                return timeB - timeA; // Más reciente primero
            });

            res.status(200).json(historyArray);
        } else if (type === "Cardio") {
            // Buscar intervals asociados con los ejercicios encontrados
            const intervals = await Interval.findAll({
                where: {
                    exercise_id: exercises.map((exercise) => exercise.id),
                },
                attributes: [
                    "exercise_id",
                    "interval_number",
                    "distance",
                    "duration",
                ],
            });

            if (!intervals || intervals.length === 0) {
                return res.status(404).json({
                    error: "No intervals found for the specified exercises",
                });
            }

            // Combinar datos de ejercicios y intervals
            const history = exercises.reduce((result, exercise) => {
                const session = sessions.find(
                    (session) => session.id === exercise.session_id
                );

                const exerciseIntervals = intervals
                    .filter((interval) => interval.exercise_id === exercise.id)
                    .map((interval) => ({
                        interval_number: interval.interval_number,
                        distance: interval.distance,
                        duration: interval.duration,
                    }));

                result[exercise.id] = {
                    session_date: session ? session.session_date : null,
                    exercise_name: exercise.exercise_name,
                    category: exercise.category,
                    image: exercise.image,
                    notes: exercise.notes,
                    start_time: exercise.start_time,
                    intervals: exerciseIntervals,
                };

                return result;
            }, {});

            // Convertir el objeto history en un array y ordenarlo por session_date y start_time
            const historyArray = Object.values(history).sort((a, b) => {
                // Primero ordenamos por fecha de sesión (session_date)
                const dateA = new Date(a.session_date);
                const dateB = new Date(b.session_date);
                if (dateA > dateB) return -1; // Si la fecha de A es más reciente que la de B, A va primero
                if (dateA < dateB) return 1;

                // Si las fechas son iguales, ordenamos por hora de inicio (start_time)
                const timeA = new Date(a.start_time);
                const timeB = new Date(b.start_time);
                return timeB - timeA; // Más reciente primero
            });

            res.status(200).json(historyArray);
        } else {
            return res.status(400).json({
                error: "Invalid exercise type.",
            });
        }
    } catch (error) {
        console.error("Error getting exercise history:", error);
        res.status(500).json({ error: "Error getting exercise history" });
    }
});

export default router;
