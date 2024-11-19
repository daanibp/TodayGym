import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const Session = sequelize.define(
    "Session",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: "id",
            },
        },
        session_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        duration: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "sessions",
        timestamps: false,
    }
);

Session.belongsTo(User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
export default Session;
