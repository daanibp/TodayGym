import express from "express";
import Session from "../models/session.js";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { Op } from "sequelize";
import Exercise from "../models/exercise.js";
import Set from "../models/set.js";

const router = express.Router();

// GET all sessions
router.get("/", async (req, res) => {
    try {
        const sessions = await Session.findAll();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve sessions" });
    }
});

// POST a new session
router.post("/pesas", async (req, res) => {
    const { date, userId } = req.query;
    try {
        const today = format(new Date(), "yyyy-MM-dd");

        const openSession = await Session.findOne({
            where: { session_date: date, type: "Pesas", user_id: userId },
        });
        if (openSession) {
            res.status(201).json(openSession);
        } else {
            const newSession = await Session.create(req.body);
            res.status(201).json(newSession);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create session" });
    }
});

router.get("/pesas/getSessionByDate", async (req, res) => {
    const { date, userId } = req.query;

    try {
        const session = await Session.findOne({
            where: { session_date: date, type: "Pesas", user_id: userId },
        });

        if (session) {
            return res.status(200).json(session);
        } else {
            return res.status(404).json({ message: "Session not found" });
        }
    } catch (error) {
        console.error("Error fetching session by date:", error);
        return res.status(500).json({ error: "Failed to fetch session" });
    }
});

// POST a new cardio session
router.post("/cardio", async (req, res) => {
    const { date, userId } = req.query;
    try {
        const today = format(new Date(), "yyyy-MM-dd");

        const openSession = await Session.findOne({
            where: { session_date: date, type: "Cardio", user_id: userId },
        });
        if (openSession) {
            res.status(201).json(openSession);
        } else {
            const newSession = await Session.create(req.body);
            res.status(201).json(newSession);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create session" });
    }
});

router.get("/cardio/getSessionByDate", async (req, res) => {
    const { date, userId } = req.query;

    try {
        const session = await Session.findOne({
            where: { session_date: date, type: "Cardio", user_id: userId },
        });

        if (session) {
            return res.status(200).json(session);
        } else {
            return res.status(404).json({ message: "Session not found" });
        }
    } catch (error) {
        console.error("Error fetching session by date:", error);
        return res.status(500).json({ error: "Failed to fetch session" });
    }
});

router.get("/week", async (req, res) => {
    try {
        // Obtener los parámetros de inicio y fin desde la query string
        const { start, end, userId } = req.query;

        let startDate, endDate;

        if (start && end) {
            // Si se proporcionan los parámetros, usarlos directamente
            startDate = new Date(start);
            endDate = new Date(end);
        } else {
            // Si no se proporcionan, calcular la semana actual (lunes a domingo)
            startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
            endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        }

        // Formatear las fechas a "yyyy-MM-dd"
        const formattedStartDate = format(startDate, "yyyy-MM-dd");
        const formattedEndDate = format(endDate, "yyyy-MM-dd");

        // Consultar las sesiones entre las fechas de inicio y fin
        const sessions = await Session.findAll({
            where: {
                session_date: {
                    [Op.between]: [formattedStartDate, formattedEndDate],
                },
                user_id: userId,
            },
            attributes: ["id", "session_date"], // Incluimos los IDs para buscar ejercicios
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "No sessions found" });
        }

        // Extraer los IDs de las sesiones
        const sessionIds = sessions.map((session) => session.id);

        // Consultar los ejercicios asociados a estas sesiones
        const exercises = await Exercise.findAll({
            where: {
                session_id: {
                    [Op.in]: sessionIds, // Filtrar por los session_id de las sesiones obtenidas
                },
            },
            attributes: ["session_id"], // Solo necesitamos los IDs de las sesiones con ejercicios
        });

        if (!exercises || exercises.length === 0) {
            return res
                .status(404)
                .json({ message: "No exercises found for these sessions" });
        }

        // Obtener los IDs únicos de las sesiones con ejercicios
        const sessionIdsWithExercises = exercises.map(
            (exercise) => exercise.session_id
        );

        // Filtrar las sesiones que tienen ejercicios asociados
        const filteredSessions = sessions.filter((session) =>
            sessionIdsWithExercises.includes(session.id)
        );

        // Extraer y formatear las fechas de las sesiones filtradas para la respuesta
        const sessionDates = filteredSessions.map((session) =>
            format(new Date(session.session_date), "yyyy-MM-dd")
        );

        // Enviar las fechas de los días con sesiones que tienen ejercicios
        res.status(200).json(sessionDates);
    } catch (error) {
        console.error(
            "Error fetching sessions with exercises for the week:",
            error
        );
        res.status(500).json({
            error: "Failed to fetch sessions with exercises for the week",
        });
    }
});

router.get("/getNumberOfSessions/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener todas las sesiones del usuario
        const sessions = await Session.findAll({
            where: { user_id: id },
            attributes: ["id"], // Solo necesitamos los ids de las sesiones
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "No sessions found" });
        }

        // Extraer los ids de las sesiones
        const sessionIds = sessions.map((session) => session.id);

        // Obtener los ejercicios asociados a esas sesiones
        const exercises = await Exercise.findAll({
            where: {
                session_id: {
                    [Op.in]: sessionIds, // Filtrar por los session_id de las sesiones obtenidas
                },
            },
            attributes: ["session_id"], // Solo necesitamos el session_id
        });

        if (!exercises || exercises.length === 0) {
            return res
                .status(404)
                .json({ message: "No exercises found for the sessions" });
        }

        // Filtrar los session_ids que tienen ejercicios asociados
        const sessionIdsWithExercises = exercises.map(
            (exercise) => exercise.session_id
        );

        // Filtrar las sesiones originales que tienen ejercicios asociados
        const filteredSessions = sessions.filter((session) =>
            sessionIdsWithExercises.includes(session.id)
        );

        // Devolver el número de sesiones con ejercicios asociados
        res.json({ numberOfSessions: filteredSessions.length });
    } catch (error) {
        console.error("Error getting number of sessions:", error);
        res.status(500).json({ error: "Error getting number of sessions" });
    }
});

router.get("/getDaysWithSession/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener todas las sesiones del usuario
        const sessions = await Session.findAll({
            where: { user_id: id },
            attributes: ["id", "session_date"], // Queremos los ids y las fechas de las sesiones
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Extraer los ids de las sesiones
        const sessionIds = sessions.map((session) => session.id);

        // Obtener los ejercicios asociados a esas sesiones
        const exercises = await Exercise.findAll({
            where: {
                session_id: {
                    [Op.in]: sessionIds, // Filtrar por los session_id de las sesiones obtenidas
                },
            },
            attributes: ["session_id"], // Solo necesitamos el session_id
        });

        if (!exercises || exercises.length === 0) {
            return res.status(404).json({ message: "No exercises found" });
        }

        // Filtrar las sesiones que tienen ejercicios asociados
        const sessionIdsWithExercises = exercises.map(
            (exercise) => exercise.session_id
        );

        // Filtrar las sesiones originales que tienen ejercicios asociados
        const filteredSessions = sessions.filter((session) =>
            sessionIdsWithExercises.includes(session.id)
        );

        // Crear un array para los días únicos
        const uniqueDays = [];

        // Iterar sobre las sesiones filtradas para agregar solo el día (sin la hora)
        filteredSessions.forEach((session) => {
            const date = session.session_date; // Convertir a formato YYYY-MM-DD

            // Verificar si el día ya está en el array uniqueDays
            if (!uniqueDays.includes(date)) {
                uniqueDays.push(date); // Solo agregamos el día si no está ya presente
            }
        });

        // Devolver los días con sesiones en formato 'YYYY-MM-DD'
        res.json({ days: uniqueDays });
    } catch (error) {
        console.error("Error getting days with sessions:", error);
        res.status(500).json({ error: "Error getting days with sessions" });
    }
});

// Ruta para obtener sesiones de una semana específica y el número de sets por categoría
router.get("/week/getNumberOfSetsByCategory", async (req, res) => {
    try {
        // Obtener los parámetros de inicio y fin desde la query string
        const { start, end, userId } = req.query;

        let startDate, endDate;

        if (start && end) {
            // Si se proporcionan los parámetros, usarlos directamente
            startDate = new Date(start);
            endDate = new Date(end);
        } else {
            // Si no se proporcionan, calcular la semana actual (lunes a domingo)
            startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
            endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        }

        // Formatear las fechas a "yyyy-MM-dd"
        const formattedStartDate = format(startDate, "yyyy-MM-dd");
        const formattedEndDate = format(endDate, "yyyy-MM-dd");

        // Consultar las sesiones entre las fechas de inicio y fin para el usuario, solo de tipo "Pesas"
        const sessions = await Session.findAll({
            where: {
                session_date: {
                    [Op.between]: [formattedStartDate, formattedEndDate],
                },
                user_id: userId,
                type: "Pesas",
            },
            attributes: ["session_date", "id"], // Seleccionamos id de la sesión para usar en la siguiente consulta
        });

        // Si no se encuentran sesiones, devolver un mensaje vacío
        if (sessions.length === 0) {
            return res.status(200).json({ setsByCategory: {} });
        }

        // Obtener los ids de las sesiones para buscar los ejercicios asociados
        const sessionIds = sessions.map((session) => session.id); // Extraer los ids de las sesiones

        // Obtener los ejercicios asociados a las sesiones
        const exercises = await Exercise.findAll({
            where: {
                session_id: {
                    [Op.in]: sessionIds, // Filtrar los ejercicios por sesión
                },
            },
        });

        // Crear un objeto para almacenar los sets por categoría
        const setsByCategory = {};

        // Iterar sobre cada ejercicio
        for (const exercise of exercises) {
            const category = exercise.category; // Obtener la categoría del ejercicio

            // Buscar los sets asociados a este ejercicio y que no sean null
            const sets = await Set.findAll({
                where: {
                    exercise_id: exercise.id, // Filtrar los sets por el ID del ejercicio
                    reps: {
                        [Op.ne]: null, // Usar Op.ne para "no igual" a null
                    },
                },
            });

            // Contar los sets para este ejercicio
            const setsCount = sets.length;

            // Sumar los sets a la categoría correspondiente
            if (setsByCategory[category]) {
                setsByCategory[category] += setsCount;
            } else {
                setsByCategory[category] = setsCount;
            }
        }

        // Verificar si el objeto `setsByCategory` está vacío
        if (Object.keys(setsByCategory).length === 0) {
            return res
                .status(404)
                .json({ error: "No sets found for the given week." });
        }

        // Enviar la respuesta con los sets por categoría
        res.status(200).json({ setsByCategory });
    } catch (error) {
        console.error("Error fetching sessions for the week:", error);
        res.status(500).json({
            error: "Failed to fetch sessions for the week",
        });
    }
});

export default router;
