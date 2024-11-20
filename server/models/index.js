"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
//const env = process.env.NODE_ENV || "development"; // Entorno actual
const db = {};

// Configuración de Sequelize desde variables de entorno
const config = {
    database: process.env.DB_NAME, // Nombre de la base de datos
    username: process.env.DB_USER, // Usuario de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña del usuario
    host: process.env.DB_HOST, // Dirección del servidor de la base de datos
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: process.env.DB_LOGGING === "true" ? console.log : false, // Habilita o deshabilita logs
};

let sequelize;
if (process.env.DATABASE_URL) {
    // Si se usa una URI de conexión (como en Heroku o Azure)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        ...config,
        dialectOptions: {
            ssl:
                process.env.DB_SSL === "true"
                    ? { require: true, rejectUnauthorized: false }
                    : false,
        },
    });
} else {
    // Configuración clásica con host, usuario y contraseña
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

// Cargar los modelos dinámicamente
fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js" &&
            file.indexOf(".test.js") === -1
        );
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        );
        db[model.name] = model;
    });

// Configurar las asociaciones, si existen
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
