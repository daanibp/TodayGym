import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Configuración de la base de datos desde las variables de entorno
const dbConfig = {
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "1234",
    database: process.env.MYSQL_DATABASE || "regym",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: {
        ssl: {
            require: true, // Asegura que SSL se use
            rejectUnauthorized: false, // Permite certificados autofirmados
        },
    },
};

// Crear una nueva instancia de Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        dialectOptions: dbConfig.dialectOptions,
    }
);

// Probar la conexión
sequelize
    .authenticate()
    .then(() => {
        console.log("Conexión a la base de datos establecida con éxito.");
    })
    .catch((error) => {
        console.error("Error al conectar con la base de datos:", error);
    });

export default sequelize;
