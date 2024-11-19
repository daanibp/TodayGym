import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surnames: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        register_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        tableName: "users", // This will map to the 'users' table in the DB
        timestamps: false,
    }
);

export default User;
