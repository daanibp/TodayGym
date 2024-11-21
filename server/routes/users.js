import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
});

// GET a single user by id
router.get("/getUserById/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve user" });
    }
});

// POST a new user
router.post("/", async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch {
        res.status(500).json({ error: "Failed to create user" });
    }
});

// PUT update an existing user
router.put("/updateUserById/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.update(req.body);
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE a user by ID
router.delete("/deleteUserById/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.destroy();
            res.json({ message: "User deleted" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Search the user by email
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Compare the passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res
                .status(401)
                .json({ error: "El E-mail o la contraseña no son correctos." });
        }

        // Active acc
        if (user.state === "Inactive") {
            sendEmail(user);
            return res.status(401).json({
                error: "La cuenta no esta verificada. Revise su correo electrónico.",
            });
        }

        // Generate a token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET
            //{ expiresIn: "1h" }
        );

        // Send the token to the client
        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                surnames: user.surnames,
                email: user.email,
                state: user.state,
                register_date: user.register_date,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Fallo en el inicio de sesión." });
    }
});

// Set the transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS,
    },
});

// Register
router.post("/register", async (req, res) => {
    const { name, surnames, email, password, register_date } = req.body;

    try {
        // Verify if the user exist
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            if (existingUser.state === "Inactive") {
                sendEmail(existingUser);
                return res.status(400).json({
                    error: "Este usuario ya existe. Reenviando correo de verificación.",
                });
            } else {
                return res.status(400).json({
                    error: "Este usuario ya existe.",
                });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = await User.create({
            name,
            surnames,
            email,
            password: hashedPassword,
            state: "Inactive",
            register_date,
        });

        sendEmail(newUser);

        // Respuesta al cliente indicando que revise su correo
        res.status(201).json({
            message:
                "Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un fallo en el registro." });
    }
});

async function sendEmail(newUser) {
    // Generate a token
    const verificationToken = jwt.sign(
        { email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    // Send the verification email
    const verificationUrl = `https://regymserver.onrender.com/users/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: "Verificación de correo electrónico",
        html: `<h2>Verifica tu correo electrónico</h2>
               <p>Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);
}

router.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Falta el token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decoded.email } });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        if (user.state === "Active") {
            return res
                .status(400)
                .json({ message: "El E-mail ya está verificado." });
        }

        user.state = "Active";
        await user.save();

        res.status(200).json({ message: "E-mail verificado exitosamente." });
    } catch (error) {
        console.error("Error: ", error.message);
        return res.status(400).json({ error: "Token inválido o expirado." });
    }
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el usuario existe
        const existingUser = await User.findOne({ where: { email: email } });
        if (!existingUser) {
            return res.status(404).json({ error: "Este usuario no existe." });
        }

        // Generar un token de verificación que expire en 1 hora
        const verificationToken = jwt.sign(
            { email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const resetPasswordUrl = `https://regymserver.onrender.com/reset-password?token=${verificationToken}`; // Cambiar a la URL del frontend

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: existingUser.email,
            subject: "Restablecimiento de la contraseña",
            html: `
                <h2>Restablece tu contraseña</h2>
                <p>Para restablecer tu contraseña, haz clic en el siguiente enlace y sigue las instrucciones:</p>
                <a href="${resetPasswordUrl}">${resetPasswordUrl}</a>
                <p>Este enlace expirará en 1 hora.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message:
                "Solicitud enviada. Revisa tu correo para restablecer tu contraseña.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un fallo en la solicitud." });
    }
});

// Reset-password
router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Buscar al usuario por email
        const existingUser = await User.findOne({ where: { email: email } });
        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.status(200).json({ message: "Contraseña restablecida con éxito." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "El token no es válido o ha expirado." });
    }
});

export default router;
