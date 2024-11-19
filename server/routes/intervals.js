import express from "express";
import Interval from "../models/interval.js";
import Exercise from "../models/exercise.js";
import Session from "../models/session.js";
import { Op } from "sequelize";

const router = express.Router();

// GET all intervals
router.get("/", async (req, res) => {
    try {
        const intervals = await Interval.findAll();
        res.json(intervals);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve intervals" });
    }
});

// POST a new interval
router.post("/", async (req, res) => {
    try {
        const newInterval = await Interval.create(req.body);
        res.status(201).json(newInterval);
    } catch (error) {
        res.status(500).json({ error: "Failed to create interval" });
    }
});

// UPDATE a interval
router.put("/updateInterval/:id", async (req, res) => {
    const { id } = req.params;
    const { exercise_id, interval_number, duration, distance } = req.body;

    try {
        const interval = await Interval.findByPk(id);
        if (!interval)
            return res.status(404).json({ error: "Interval not found" });

        console.log("Interval to update:", duration, distance);

        // Actualizar los valores
        interval.exercise_id = exercise_id;
        interval.interval_number = interval_number;
        interval.duration = duration;
        interval.distance = distance;

        // Guardar los cambios en la base de datos
        await interval.save();
        // Devolver el interval actualizado como respuesta
        return res.json(interval);
    } catch (error) {
        console.error("Error updating interval:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/getIntervalBySessionId/:session_id", async (req, res) => {
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

        // Buscar todos los intervals que correspondan a esos ejercicios
        const intervals = await Interval.findAll({
            where: {
                exercise_id: exerciseIds, // Filtrar por los IDs de ejercicios
            },
        });

        if (intervals.length === 0) {
            return res.status(404).json({
                message: "No intervals found for the exercises in this session",
            });
        }

        res.status(200).json(intervals); // Devolver los intervals encontrados
    } catch (error) {
        console.error("Error fetching intervals:", error);
        res.status(500).json({ error: "Failed to fetch intervals" });
    }
});

router.delete("/deleteById/:intervalId", async (req, res) => {
    const { intervalId } = req.params;

    try {
        // Intenta encontrar y eliminar el interval por su ID
        const result = await Interval.destroy({ where: { id: intervalId } });

        if (result === 1) {
            // Si se encontró y eliminó el Interval
            res.status(200).json({ message: "Interval deleted successfully" });
        } else {
            // Si no se encontró el Interval
            res.status(404).json({ error: "Interval not found" });
        }
    } catch (error) {
        console.error("Error deleting Interval:", error);
        res.status(500).json({ error: "Failed to delete Interval" });
    }
});

router.get("/getLastValue", async (req, res) => {
    const { userId, exerciseId, intervalNumber, selectedDate } = req.query;

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
        let lastInterval = null;

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
                // Buscar el último interval con el mismo interval_number
                const interval = await Interval.findOne({
                    where: {
                        exercise_id: exercise.id,
                        interval_number: intervalNumber,
                    },
                });
                if (exerciseId === exercise.id) {
                    // Es el mismo
                    continue;
                }
                // Si encontramos un interval que cumple los criterios, lo asignamos y salimos del bucle
                else if (interval) {
                    if (
                        interval.distance == null ||
                        interval.duration == null
                    ) {
                        continue;
                    } else {
                        lastInterval = interval;
                        break;
                    }
                }
            }
            if (lastInterval) {
                break;
            }
        }

        if (lastInterval) {
            res.json(lastInterval); // Devolver el último interval encontrado
        } else {
            res.status(404).json({
                message:
                    "No se encontraron intervals anteriores para este ejercicio y número de interval.",
            });
        }
    } catch (error) {
        console.error("Error getting last value:", error);
        res.status(500).json({ error: "Failed to retrieve last value" });
    }
});

router.put("/updateLastValueForNextInterval", async (req, res) => {
    const {
        userId,
        exerciseId,
        intervalNumber,
        selectedDate,
        newDuration,
        newDistance,
    } = req.body;

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

        // Iterar sobre las sesiones para encontrar el siguiente intreval con el mismo nombre de ejercicio y número de interval
        let nextInterval = null;

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

                // Encontrar el interval en el ejercicio actual con el mismo interval_number
                const interval = await Interval.findOne({
                    where: {
                        exercise_id: exercise.id,
                        interval_number: intervalNumber,
                    },
                });

                // Si encontramos el siguiente interval, lo asignamos y salimos del bucle
                if (interval) {
                    nextInterval = interval;
                    break;
                }
            }

            if (nextInterval) break; // Romper el bucle externo si ya encontramos el siguiente interval
        }

        if (nextInterval) {
            // Si son null porque ya no existen
            if (newDuration == null || newDistance == null) {
                await nextInterval.update({
                    lastValue: "-",
                });
            } else {
                // Actualizar el lastValue del siguiente interval con el valor del interval actual
                await nextInterval.update({
                    lastValue: `${newDistance}km en ${newDuration}min`, // Aquí se ajusta al valor actualizado
                });
            }

            res.json({
                message: "Last value actualizado en el siguiente interval.",
                updatedInterval: nextInterval,
            });
        } else {
            res.status(404).json({
                message:
                    "No se encontraron intervals posteriores para este ejercicio y número de interval.",
            });
        }
    } catch (error) {
        console.error(
            "Error actualizando last value para el siguiente interval:",
            error
        );
        res.status(500).json({
            error: "Failed to update last value for next interval",
        });
    }
});

// Actualizar los valores de lastValue para el siguiente ejercicio tras borrar un interval
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

        const intervalsToUpdate = await Interval.findAll({
            where: {
                exercise_id: nextExercise.id,
            },
            order: [["interval_number", "ASC"]],
        });

        if (intervalsToUpdate.length === 0) {
            return res.status(404).json({
                message:
                    "No se encontraron intervals en el siguiente ejercicio.",
            });
        }

        for (const interval of intervalsToUpdate) {
            const lastInterval = await getLastValue(
                userId,
                interval.exercise_id,
                interval.interval_number,
                selectedDate
            );

            if (lastInterval) {
                const lastValue = `${lastInterval.distance}km en ${lastInterval.duration}min`;
                await interval.update({ lastValue: lastValue });
            } else {
                await interval.update({ lastValue: "-" });
            }
        }

        res.json({
            message: "Last values actualizados en el siguiente ejercicio.",
            updatedIntervals: intervalsToUpdate,
        });
    } catch (error) {
        console.error("Error actualizando last values:", error);
        res.status(500).json({
            error: "Failed to update last values in next exercise",
        });
    }
});

router.put(
    "/updateIntervalsFromSameExerciseId/:intervalId",
    async (req, res) => {
        const { intervalId } = req.params;

        try {
            // Obtener el interval con el intervalId proporcionado
            const intervalToUpdate = await Interval.findOne({
                where: { id: intervalId },
            });

            if (!intervalToUpdate) {
                return res
                    .status(404)
                    .json({ message: "Interval no encontrado." });
            }

            // Obtener todos los intervals con el mismo exercise_id ordenados por interval_number
            const intervalsToUpdate = await Interval.findAll({
                where: {
                    exercise_id: intervalToUpdate.exercise_id, // Mismo exercise_id
                    interval_number: {
                        [Op.gte]: intervalToUpdate.interval_number,
                    }, // Interval_numbers superiores o iguales
                },
                order: [["interval_number", "ASC"]], // Ordenar por interval_number ascendente
            });

            // Verificar si hay intervals posteriores al interval actual
            if (intervalsToUpdate.length <= 1) {
                return res.status(400).json({
                    message: "No hay intervals posteriores para actualizar.",
                });
            }

            // Desplazar los valores de lastValue y interval_number de los intervals posteriores
            for (let i = intervalsToUpdate.length - 1; i > 0; i--) {
                const currentInterval = intervalsToUpdate[i];
                const previousInterval = intervalsToUpdate[i - 1];

                // Actualizar el lastValue del interval actual con el lastValue del interval anterior
                await Interval.update(
                    {
                        lastValue: previousInterval.lastValue,
                        interval_number: previousInterval.interval_number,
                    },
                    { where: { id: currentInterval.id } }
                );
            }

            return res.status(200).json({
                message:
                    "lastValues y interval_numbers actualizados exitosamente.",
            });
        } catch (error) {
            console.error(
                "Error al actualizar lastValues y interval_numbers:",
                error
            );
            res.status(500).json({
                error: "Error al actualizar los lastValues y interval_numbers.",
            });
        }
    }
);

// Función auxiliar para obtener el último valor de intervals anteriores
async function getLastValue(userId, exerciseId, intervalNumber, selectedDate) {
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

            const interval = await Interval.findOne({
                where: {
                    exercise_id: exercise.id,
                    interval_number: intervalNumber,
                },
            });

            if (
                interval &&
                interval.duration != null &&
                interval.distance != null
            ) {
                return interval; // Retorna el último interval encontrado con datos válidos
            }
        }
    }

    return null;
}

export default router;
