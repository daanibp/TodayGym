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
router.post("/pesas/:date", async (req, res) => {
    const { date } = req.params;
    try {
        const today = format(new Date(), "yyyy-MM-dd");

        const openSession = await Session.findOne({
            where: { session_date: date, type: "Pesas" },
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
router.post("/cardio/:date", async (req, res) => {
    const { date } = req.params;
    try {
        const today = format(new Date(), "yyyy-MM-dd");

        const openSession = await Session.findOne({
            where: { session_date: date, type: "Cardio" },
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

// Ruta para obtener sesiones de una semana específica
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
            attributes: ["session_date"], // Solo seleccionamos las fechas
        });

        // Extraer y formatear las fechas de las sesiones para la respuesta
        const sessionDates = sessions.map((session) =>
            format(new Date(session.session_date), "yyyy-MM-dd")
        );

        // Enviar las fechas de los días con sesiones
        res.status(200).json(sessionDates);
    } catch (error) {
        console.error("Error fetching sessions for the week:", error);
        res.status(500).json({
            error: "Failed to fetch sessions for the week",
        });
    }
});

router.get("/getNumberOfSessions/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const sessions = await Session.findAll({
            where: { user_id: id },
        });

        if (!sessions) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.json({ numberOfSessions: sessions.length });
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
            attributes: ["session_date"],
        });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Crear un conjunto (set) de días únicos
        const uniqueDays = [];

        // Iterar sobre las sesiones para agregar solo el día (sin la hora)
        sessions.forEach((session) => {
            uniqueDays.push(session.session_date);
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
