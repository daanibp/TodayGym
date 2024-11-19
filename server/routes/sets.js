import express from "express";
import Set from "../models/set.js";
import Exercise from "../models/exercise.js";
import Session from "../models/session.js";
import { Op } from "sequelize";

const router = express.Router();

// GET all sets
router.get("/", async (req, res) => {
    try {
        const sets = await Set.findAll();
        res.json(sets);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve sets" });
    }
});

// POST a new sets
router.post("/", async (req, res) => {
    try {
        const newSet = await Set.create(req.body);
        res.status(201).json(newSet);
    } catch (error) {
        res.status(500).json({ error: "Failed to create set" });
    }
});

// UPDATE a set
router.put("/updateSets/:id", async (req, res) => {
    const { id } = req.params; // Obtener el ID del set desde los parámetros de la URL
    const { exercise_id, set_number, weight, reps } = req.body; // Obtener los datos del cuerpo de la solicitud

    try {
        const set = await Set.findByPk(id);
        if (!set) return res.status(404).json({ error: "Set not found" });

        console.log("Set to update:", weight, reps);

        // Actualizar los valores
        set.exercise_id = exercise_id;
        set.set_number = set_number;
        set.weight = weight;
        set.reps = reps;

        // Guardar los cambios en la base de datos
        await set.save();
        // Devolver el set actualizado como respuesta
        return res.json(set);
    } catch (error) {
        console.error("Error updating set:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/getSetBySessionId/:session_id", async (req, res) => {
    const { session_id } = req.params;

    try {
        // Buscar todos los ejercicios que pertenezcan a la sesión
        const exercises = await Exercise.findAll({
            where: { session_id: session_id },
        });

        if (exercises.length === 0) {
            return res
                .status(404)
                .json({ message: "No exercises found for this session" });
        }

        // Obtener los IDs de los ejercicios
        const exerciseIds = exercises.map((exercise) => exercise.id);

        // Buscar todos los sets que correspondan a esos ejercicios
        const sets = await Set.findAll({
            where: {
                exercise_id: exerciseIds, // Filtrar por los IDs de ejercicios
            },
        });

        if (sets.length === 0) {
            return res.status(404).json({
                message: "No sets found for the exercises in this session",
            });
        }

        res.status(200).json(sets); // Devolver los sets encontrados
    } catch (error) {
        console.error("Error fetching sets:", error);
        res.status(500).json({ error: "Failed to fetch sets" });
    }
});

router.delete("/deleteById/:setId", async (req, res) => {
    const { setId } = req.params;

    try {
        // Intenta encontrar y eliminar el set por su ID
        const result = await Set.destroy({ where: { id: setId } });

        if (result === 1) {
            // Si se encontró y eliminó el set
            res.status(200).json({ message: "Set deleted successfully" });
        } else {
            // Si no se encontró el set
            res.status(404).json({ error: "Set not found" });
        }
    } catch (error) {
        console.error("Error deleting set:", error);
        res.status(500).json({ error: "Failed to delete set" });
    }
});

router.get("/getLastValue", async (req, res) => {
    const { userId, exerciseId, setNumber, selectedDate } = req.query;

    try {
        // Obtener el nombre del ejercicio actual por su ID
        const currentExercise = await Exercise.findOne({
            where: { id: exerciseId },
        });

        if (!currentExercise) {
            return res
                .status(404)
                .json({ message: "Ejercicio no encontrado." });
        }

        const exerciseName = currentExercise.exercise_name;

        // Buscar todas las sesiones anteriores o iguales a la fecha seleccionada
        const sessions = await Session.findAll({
            where: {
                user_id: userId,
                session_date: {
                    [Op.lte]: selectedDate, // Filtrar por fechas <= a la seleccionada
                },
            },
            order: [["session_date", "DESC"]], // Ordenar por fecha descendente
        });

        if (sessions.length === 0) {
            return res.status(404).json({
                message:
                    "No se encontraron sesiones anteriores a la fecha seleccionada.",
            });
        }

        // Iterar sobre las sesiones para encontrar el ejercicio más reciente con el mismo nombre
        let lastSet = null;

        for (const session of sessions) {
            const exercises = await Exercise.findAll({
                where: {
                    session_id: session.id,
                    exercise_name: exerciseName, // Buscar ejercicios con el mismo nombre
                },
                order: [["start_time", "DESC"]], // Ordenar por start_time descendente
            });

            // Si no hay ejercicios con el mismo nombre en esta sesión, pasar a la siguiente
            if (exercises.length === 0) continue;

            for (const exercise of exercises) {
                // Buscar el último set con el mismo set_number
                const set = await Set.findOne({
                    where: {
                        exercise_id: exercise.id,
                        set_number: setNumber,
                    },
                });
                if (exerciseId === exercise.id) {
                    // Es el mismo
                    continue;
                }
                // Si encontramos un set que cumple los criterios, lo asignamos y salimos del bucle
                else if (set) {
                    if (set.weight == null || set.reps == null) {
                        continue;
                    } else {
                        lastSet = set;
                        break;
                    }
                }
            }
            if (lastSet) {
                break;
            }
        }

        if (lastSet) {
            res.json(lastSet); // Devolver el último set encontrado
        } else {
            res.status(404).json({
                message:
                    "No se encontraron sets anteriores para este ejercicio y número de set.",
            });
        }
    } catch (error) {
        console.error("Error getting last value:", error);
        res.status(500).json({ error: "Failed to retrieve last value" });
    }
});

router.put("/updateLastValueForNextSet", async (req, res) => {
    const { userId, exerciseId, setNumber, selectedDate, newWeight, newReps } =
        req.body;

    try {
        // Obtener el nombre del ejercicio actual por su ID
        const currentExercise = await Exercise.findOne({
            where: { id: exerciseId },
        });

        if (!currentExercise) {
            return res
                .status(404)
                .json({ message: "Ejercicio no encontrado." });
        }

        const exerciseName = currentExercise.exercise_name;

        // Buscar todas las sesiones posteriores a la fecha seleccionada para este usuario
        const sessions = await Session.findAll({
            where: {
                user_id: userId,
                session_date: {
                    [Op.gt]: selectedDate, // Fechas mayores a la seleccionada
                },
            },
            order: [["session_date", "ASC"]], // Orden ascendente para obtener la primera sesión posterior
        });

        if (sessions.length === 0) {
            return res.status(404).json({
                message:
                    "No se encontraron sesiones posteriores a la fecha seleccionada.",
            });
        }

        // Iterar sobre las sesiones para encontrar el siguiente set con el mismo nombre de ejercicio y número de set
        let nextSet = null;

        for (const session of sessions) {
            const exercises = await Exercise.findAll({
                where: {
                    session_id: session.id,
                    exercise_name: exerciseName,
                },
                order: [["start_time", "ASC"]],
            });

            if (exercises.length === 0) continue;

            for (const exercise of exercises) {
                if (exercise.id === exerciseId) continue; // Omite el mismo ejercicio

                // Encontrar el set en el ejercicio actual con el mismo set_number
                const set = await Set.findOne({
                    where: {
                        exercise_id: exercise.id,
                        set_number: setNumber,
                    },
                });

                // Si encontramos el siguiente set, lo asignamos y salimos del bucle
                if (set) {
                    nextSet = set;
                    break;
                }
            }

            if (nextSet) break; // Romper el bucle externo si ya encontramos el siguiente set
        }

        if (nextSet) {
            // Si son null porque ya no existen
            if (newWeight == null || newReps == null) {
                await nextSet.update({
                    lastValue: "-",
                });
            } else {
                // Actualizar el lastValue del siguiente set con el valor del set actual
                await nextSet.update({
                    lastValue: `${newWeight}kg x ${newReps}`, // Aquí se ajusta al valor actualizado
                });
            }

            res.json({
                message: "Last value actualizado en el siguiente set.",
                updatedSet: nextSet,
            });
        } else {
            res.status(404).json({
                message:
                    "No se encontraron sets posteriores para este ejercicio y número de set.",
            });
        }
    } catch (error) {
        console.error(
            "Error actualizando last value para el siguiente set:",
            error
        );
        res.status(500).json({
            error: "Failed to update last value for next set",
        });
    }
});

// Actualizar los valores de lastValue para el siguiente ejercicio tras borrar un set
router.put("/updateLastValuesForNextExercise", async (req, res) => {
    const { userId, exerciseId, selectedDate } = req.body;

    try {
        const currentExercise = await Exercise.findOne({
            where: { id: exerciseId },
        });

        if (!currentExercise) {
            return res
                .status(404)
                .json({ message: "Ejercicio no encontrado." });
        }

        const exerciseName = currentExercise.exercise_name;

        const sessions = await Session.findAll({
            where: {
                user_id: userId,
                session_date: {
                    [Op.gt]: selectedDate,
                },
            },
            order: [["session_date", "ASC"]],
        });

        if (sessions.length === 0) {
            return res
                .status(404)
                .json({ message: "No se encontraron sesiones posteriores." });
        }

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

        if (!nextExercise) {
            return res.status(404).json({
                message:
                    "No se encontraron ejercicios posteriores con el mismo nombre.",
            });
        }

        const setsToUpdate = await Set.findAll({
            where: {
                exercise_id: nextExercise.id,
            },
            order: [["set_number", "ASC"]],
        });

        if (setsToUpdate.length === 0) {
            return res.status(404).json({
                message: "No se encontraron sets en el siguiente ejercicio.",
            });
        }

        for (const set of setsToUpdate) {
            const lastSet = await getLastValue(
                userId,
                set.exercise_id,
                set.set_number,
                selectedDate
            );

            if (lastSet) {
                const lastValue = `${lastSet.weight}kg x ${lastSet.reps}`;
                await set.update({ lastValue: lastValue });
            } else {
                await set.update({ lastValue: "-" });
            }
        }

        res.json({
            message: "Last values actualizados en el siguiente ejercicio.",
            updatedSets: setsToUpdate,
        });
    } catch (error) {
        console.error("Error actualizando last values:", error);
        res.status(500).json({
            error: "Failed to update last values in next exercise",
        });
    }
});

router.put("/updateSetsFromSameExerciseId/:setId", async (req, res) => {
    const { setId } = req.params;

    try {
        // Obtener el set con el setId proporcionado
        const setToUpdate = await Set.findOne({
            where: { id: setId },
        });

        if (!setToUpdate) {
            return res.status(404).json({ message: "Set no encontrado." });
        }

        // Obtener todos los sets con el mismo exercise_id ordenados por set_number
        const setsToUpdate = await Set.findAll({
            where: {
                exercise_id: setToUpdate.exercise_id, // Mismo exercise_id
                set_number: { [Op.gte]: setToUpdate.set_number }, // Set_numbers superiores o iguales
            },
            order: [["set_number", "ASC"]], // Ordenar por set_number ascendente
        });

        // Verificar si hay sets posteriores al set actual
        if (setsToUpdate.length <= 1) {
            return res
                .status(400)
                .json({ message: "No hay sets posteriores para actualizar." });
        }

        // Desplazar los valores de lastValue y set_number de los sets posteriores
        for (let i = setsToUpdate.length - 1; i > 0; i--) {
            const currentSet = setsToUpdate[i];
            const previousSet = setsToUpdate[i - 1];

            // Actualizar el lastValue del set actual con el lastValue del set anterior
            await Set.update(
                {
                    lastValue: previousSet.lastValue,
                    set_number: previousSet.set_number,
                },
                { where: { id: currentSet.id } }
            );
        }

        return res.status(200).json({
            message: "lastValues y set_numbers actualizados exitosamente.",
        });
    } catch (error) {
        console.error("Error al actualizar lastValues y set_numbers:", error);
        res.status(500).json({
            error: "Error al actualizar los lastValues y set_numbers.",
        });
    }
});

// Función auxiliar para obtener el último valor de sets anteriores
async function getLastValue(userId, exerciseId, setNumber, selectedDate) {
    // Obtener el nombre del ejercicio actual por su ID
    const currentExercise = await Exercise.findOne({
        where: { id: exerciseId },
    });

    if (!currentExercise) {
        throw new Error("Ejercicio no encontrado.");
    }

    const exerciseName = currentExercise.exercise_name;

    // Buscar todas las sesiones anteriores o iguales a la fecha seleccionada
    const sessions = await Session.findAll({
        where: {
            user_id: userId,
            session_date: {
                [Op.lte]: selectedDate,
            },
        },
        order: [["session_date", "DESC"]],
    });

    if (sessions.length === 0) return null;

    // Iterar sobre las sesiones para encontrar el ejercicio más reciente con el mismo nombre
    for (const session of sessions) {
        const exercises = await Exercise.findAll({
            where: {
                session_id: session.id,
                exercise_name: exerciseName,
            },
            order: [["start_time", "DESC"]],
        });

        if (exercises.length === 0) continue;

        for (const exercise of exercises) {
            if (exercise.id === exerciseId) continue;

            const set = await Set.findOne({
                where: {
                    exercise_id: exercise.id,
                    set_number: setNumber,
                },
            });

            if (set && set.weight != null && set.reps != null) {
                return set; // Retorna el último set encontrado con datos válidos
            }
        }
    }

    return null;
}

export default router;
