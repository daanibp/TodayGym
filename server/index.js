import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sequelize from "./config/database.js";
import userRoutes from "./routes/users.js"; // Import user routes
import sessionRoutes from "./routes/sessions.js"; // Import session routes
import exerciseRoutes from "./routes/exercises.js"; // Import exercise routes
import setRoutes from "./routes/sets.js"; // Import set routes
import intervalRoutes from "./routes/intervals.js"; // Import interval routes

const app = express();
app.use(bodyParser.json());
app.use(express.json());
// Configuración de CORS
// app.use(
//     cors({
//         origin: "https://blue-sky-0c4158f10.5.azurestaticapps.net", // Permite solo el frontend de esta dirección
//         methods: ["GET", "POST", "DELETE", "PUT"], // Métodos permitidos
//         credentials: true, // Permite enviar cookies
//     })
// );

const port = process.env.PORT || 5001;

// Use the routes
app.use("/users", userRoutes); // All user-related routes will be under /users
app.use("/sessions", sessionRoutes); // All session-related routes under /sessions
app.use("/exercises", exerciseRoutes); // All exercise-related routes under /exercises
app.use("/sets", setRoutes); // All set-related routes under /sets
app.use("/intervals", intervalRoutes); // All set-related routes under /sets

// Synchronize Sequelize models with the database
sequelize
    .sync()
    .then(() => {
        console.log("Database connected and models synchronized.");
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Unable to connect to the database:", err);
    });
